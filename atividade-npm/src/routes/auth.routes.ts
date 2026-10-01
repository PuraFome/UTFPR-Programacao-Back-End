import { Router } from 'express';
import {
  register,
  listUsers,
  updateUser,
  deleteUser,
  getUser,
  verifyLogin,
} from '../controllers/auth.controller';

export const authRouter = Router();

// POST /login — Criar/Registrar usuário
authRouter.post('/login', register);

// GET /login — Listar usuários
authRouter.get('/login', listUsers);

// GET /login/:id — Ver usuário específico
authRouter.get('/login/:id', getUser);

// PUT /login/:id — Atualizar usuário
authRouter.put('/login/:id', updateUser);

// DELETE /login/:id — Deletar usuário
authRouter.delete('/login/:id', deleteUser);

// POST /login/verify — Verificar login
authRouter.post('/login/verify', verifyLogin);