import { Request, Response } from 'express';
import { registerSchema } from '../validation/schemas';
import { hashPassword, comparePassword, checkUniqueness } from '../services/auth.service';
import { pool } from '../services/db.service';

// POST /login — Criar/Registrar usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Validação falhou', details: parse.error.errors });
    return;
  }

  const { email, username, nickname, password } = parse.data;

  const { emailExists, usernameExists, nicknameExists } = await checkUniqueness(
    email,
    username,
    nickname,
  );
  if (emailExists || usernameExists || nicknameExists) {
    res.status(409).json({
      error: 'Conflito: campos já em uso',
      details: {
        email: emailExists,
        username: usernameExists,
        nickname: nicknameExists,
      },
    });
    return;
  }

  const password_hash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (email, username, nickname, password_hash)
     VALUES ($1, $2, $3, $4) RETURNING id, email, username, nickname, created_at`,
    [email, username, nickname, password_hash],
  );

  res.status(201).json(result.rows[0]);
};

// GET /login — Listar usuários (sem senha)
export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT id, email, username, nickname, created_at FROM users ORDER BY created_at DESC`,
  );
  res.status(200).json(result.rows);
};

// PUT /login/:id — Atualizar usuário
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const parse = registerSchema.partial().safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Validação falhou', details: parse.error.errors });
    return;
  }

  const fields = parse.data as Partial<Record<'email' | 'username' | 'nickname' | 'password', string>>;
  const setParts: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (fields.email) {
    setParts.push(`email = $${idx++}`);
    values.push(fields.email);
  }
  if (fields.username) {
    setParts.push(`username = $${idx++}`);
    values.push(fields.username);
  }
  if (fields.nickname) {
    setParts.push(`nickname = $${idx++}`);
    values.push(fields.nickname);
  }
  if (fields.password) {
    const hash = await hashPassword(fields.password);
    setParts.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  if (setParts.length === 0) {
    res.status(400).json({ error: 'Nenhum campo para atualizar' });
    return;
  }

  values.push(numericId);
  const sql = `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, email, username, nickname`;
  const result = await pool.query(sql, values);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json(result.rows[0]);
};

// DELETE /login/:id — Deletar usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [numericId]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json({ message: 'Usuário deletado com sucesso' });
};

// GET /login/:id — Ver usuário específico (extra)
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  const result = await pool.query(
    `SELECT id, email, username, nickname, created_at FROM users WHERE id = $1`,
    [numericId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.status(200).json(result.rows[0]);
};

// POST /login/:id/verify — Verificar login
export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
    return;
  }

  const result = await pool.query(
    `SELECT id, email, username, nickname, password_hash FROM users WHERE email = $1`,
    [email],
  );

  if (result.rowCount === 0) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const user = result.rows[0];
  const passwordIsValid = await comparePassword(password, user.password_hash);
  if (!passwordIsValid) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  res.status(200).json({
    message: 'Login realizado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
    },
  });
};