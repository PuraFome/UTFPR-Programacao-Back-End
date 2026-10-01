import dotenv from 'dotenv';
import { pool } from './services/db.service';
import { app } from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await pool.query(`SELECT 1`);
    console.log('Conectado ao CockroachDB');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao conectar ao banco:', err);
    process.exit(1);
  }
};

start();