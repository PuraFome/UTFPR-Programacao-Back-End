import bcrypt from 'bcryptjs';
import { pool } from './db.service';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const checkUniqueness = async (
  email: string,
  username: string,
  nickname: string,
  excludeId?: number,
): Promise<{ emailExists: boolean; usernameExists: boolean; nicknameExists: boolean }> => {
  const result = await pool.query(
    `SELECT id, email, username, nickname FROM users
     WHERE email = $1 OR username = $2 OR nickname = $3
     ${excludeId ? 'AND id != $4' : ''}`,
    excludeId ? [email, username, nickname, excludeId] : [email, username, nickname],
  );

  return {
    emailExists: result.rows.some((r) => r.email === email),
    usernameExists: result.rows.some((r) => r.username === username),
    nicknameExists: result.rows.some((r) => r.nickname === nickname),
  };
};