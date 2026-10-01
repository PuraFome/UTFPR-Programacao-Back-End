import { z } from 'zod';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const NICKNAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{2,40}$/;

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido').max(255),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username muito longo')
    .regex(USERNAME_REGEX, 'Username aceita apenas letras, números e underline'),
  nickname: z
    .string()
    .min(2, 'Nickname deve ter pelo menos 2 caracteres')
    .max(50, 'Nickname muito longo')
    .regex(NICKNAME_REGEX, 'Nickname contém caracteres inválidos'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;