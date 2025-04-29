import express from 'express';
import * as dotenv from 'dotenv';
import routes from './routes.js'
import { sequelize } from './models/index.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000'
}));

const port = process.env.PORT || 3000;

sequelize.authenticate().then(
   () => {

    console.log('banco conectado'),

    sequelize.sync().then(() => {
        console.log('Tabelas sincronizadas');
        
        // Inicia o servidor depois de autenticar e sincronizar o banco
        app.listen(port, () => {
          console.log(`Servidor rodando na porta ${port}`);
        });
      }).catch(err => {
        console.error('Erro ao sincronizar as tabelas:', err);
      });

   }
   
).catch(err => {
    console.error(err)
});

app.use(routes);
