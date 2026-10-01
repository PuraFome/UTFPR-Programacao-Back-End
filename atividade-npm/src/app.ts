import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from './routes/auth.routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Página inicial redireciona para login
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rotas de autenticação (CRUD)
app.use('/api', authRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorMiddleware);
