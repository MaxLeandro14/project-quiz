import User from '../models/User.js'
import crypto from 'node:crypto'
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET

export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        
        // Gere um JWT
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        const responseUser = {
            email_verified_at: user.email_verified_at,
            ativo: user.ativo,
            conta_verificada: user.conta_verificada,
            name: user.name,
            email: user.email,
            bio: user.bio,
            url_avatar: user.url_avatar,
        };

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: responseUser,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token do Google é obrigatório' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();
        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                id: crypto.randomUUID(),
                name,
                email,
                password: null,
            });
        }

        const responseUser = {
            email_verified_at: user.email_verified_at,
            ativo: user.ativo,
            conta_verificada: user.conta_verificada,
            name: user.name,
            email: user.email,
            bio: user.bio,
            url_avatar: user.url_avatar,
        };

        res.status(201).json({
            message: 'Operação realizada com sucesso',
            user: responseUser,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao autenticar com Google', error: error.message });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se a senha está correta
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        const responseUser = {
            email_verified_at: user.email_verified_at,
            ativo: user.ativo,
            conta_verificada: user.conta_verificada,
            name: user.name,
            email: user.email,
            bio: user.bio,
            url_avatar: user.url_avatar,
        };

        res.status(201).json({
            message: 'Operação realizada com sucesso',
            user: responseUser,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao tentar fazer login', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
      const userId = req.user?.id;
      const { name, bio } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
  
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      user.name = name || user.name;
      user.bio = bio || user.bio;
      await user.save();
  
      res.status(200).json({ message: 'Perfil atualizado com sucesso', user });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
    }
  };
  
  // Atualizar status de ativo/inativo
  export const updateAtivo = async (req, res) => {
    try {
      const userId = req.user?.id;
      const { ativo } = req.body;
  
      if (typeof ativo !== 'boolean') {
        return res.status(400).json({ message: 'O campo "ativo" deve ser booleano' });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      user.ativo = ativo;
      await user.save();
  
      res.status(200).json({ message: 'Status atualizado com sucesso', ativo: user.ativo });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar status', error: error.message });
    }
  };
  
  // Excluir usuário (autodelete)
  export const deleteUser = async (req, res) => {
    try {
      const userId = req.user?.id;
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      await user.destroy();
  
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
    }
  };
  