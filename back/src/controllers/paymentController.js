import Stripe from 'stripe';
import Subscription from '../models/Subscription';
import User from '../models/User';

// Inicializar Stripe (pode ser alterado para outro provedor no futuro)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscription = async (req, res) => {
    const { plan, paymentMethodId } = req.body;

    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        // Criar um cliente no Stripe
        const customer = await stripe.customers.create({ email: user.email });

        // Criar a assinatura no Stripe
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: getPlanPriceId(plan) }],
            default_payment_method: paymentMethodId,
            expand: ['latest_invoice.payment_intent']
        });

        // Salvar no banco de dados
        const newSubscription = await Subscription.create({
            user_id: userId,
            provider: 'stripe',
            subscription_provider_id: subscription.id,
            customer_provider_id: customer.id,
            plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
        });

        return res.status(200).json({ message: 'Registro feito com sucesso', subscription: newSubscription });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao criar registro' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        const subscription = await Subscription.findOne({ where: { user_id: userId } });
        if (!subscription) return res.status(404).json({ error: 'Assinatura não encontrada' });

        await stripe.subscriptions.del(subscription.subscription_provider_id);

        await subscription.update({ status: 'canceled' });

        return res.status(200).json({ message: 'Assinatura cancelada com sucesso' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
};

export const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        const subscription = await Subscription.findOne({ where: { user_id: userId } });
        if (!subscription) return res.status(404).json({ error: 'Assinatura não encontrada' });

        return res.status(200).json({ subscription });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar assinatura' });
    }
};

export const handleWebhook = async (req, res) => {
    let event;
    const sig = req.headers['stripe-signature'];

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscriptionId = event.data.object.subscription;
        const subscription = await Subscription.findOne({ where: { subscription_provider_id: subscriptionId } });

        if (subscription) {
            await subscription.update({ status: 'active' });
        }
    } else if (event.type === 'customer.subscription.deleted') {
        const subscriptionId = event.data.object.id;
        const subscription = await Subscription.findOne({ where: { subscription_provider_id: subscriptionId } });

        if (subscription) {
            await subscription.update({ status: 'canceled' });
        }
    }

    res.status(200).send('Evento recebido');
};

// Rota para ´reativar uma assinatura dentro do prazo
export const reactivateSubscription = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        const subscription = await Subscription.findOne({ 
            where: { user_id: userId, status: 'canceled' }
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Nenhuma assinatura cancelada encontrada.' });
        }

        // Reativa a assinatura se ainda estiver dentro do período pago
        await stripe.subscriptions.update(subscription.subscription_provider_id, {
            cancel_at_period_end: false
        });

        // Atualiza o status no banco de dados
        await subscription.update({ status: 'active' });

        return res.status(200).json({ message: 'Assinatura reativada com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao reativar a assinatura.' });
    }
};

// Rota para criar uma nova assinatura se a anterior expirou
export const createNewSubscription = async (req, res) => {
    try {
        const { priceId } = req.body;
        
        const userId = req.user?.id;
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        const subscription = await Subscription.findOne({ where: { user_id: userId } });

        if (!subscription) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Criar uma nova assinatura no Stripe
        const newSubscription = await stripe.subscriptions.create({
            customer: subscription.customer_provider_id,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Atualiza ou cria um novo registro da assinatura no banco
        await Subscription.update(
            {
                subscription_provider_id: newSubscription.id,
                status: 'active',
                price_provider_id: priceId
            },
            { where: { user_id: userId } }
        );

        return res.status(200).json({ message: 'Nova assinatura criada com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao criar nova assinatura.' });
    }
};

// Função auxiliar para mapear planos
const getPlanPriceId = (plan) => {
    const prices = {
        mensal: process.env.STRIPE_PRICE_ID_AVULSO,
        assinatura: process.env.STRIPE_PRICE_ID_ASSINATURA
    };
    return prices[plan] || null;
};
