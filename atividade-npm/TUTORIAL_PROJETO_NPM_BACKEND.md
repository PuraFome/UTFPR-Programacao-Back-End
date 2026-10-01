# Tutorial: Projeto NPM Padrão com React Backend + CockroachDB

> **Stack:** Node.js · TypeScript · Express · CockroachDB (pg) · bcryptjs · zod · dotenv · cors
> **Documentação vinculada aos arquivos reais do projeto em `atividade-npm/`**

---

## 1. Estrutura de Diretórios (Reais)

```
atividade-npm/
├── public/
│   └── index.html          # Home → redireciona para /api/login (3s ou link)
├── src/
│   ├── app.ts              # Configuração Express + route /api + health
│   ├── server.ts           # Ponto de entrada (conexão CockroachDB + listen)
│   ├── routes/
│   │   └── auth.routes.ts  # Rotas /login (CRUD completo)
│   ├── controllers/
│   │   └── auth.controller.ts # register | listUsers | getUser | updateUser | deleteUser | verifyLogin
│   ├── services/
│   │   ├── db.service.ts   # Pool pg com DATABASE_URL do .env
│   │   └── auth.service.ts # hashPassword | comparePassword | checkUniqueness
│   ├── models/             # (pendente - User interface está em schemas)
│   ├── middleware/
│   │   └── error.middleware.ts
│   └── validation/
│       └── schemas.ts      # registerSchema (email, username, nickname, password)
├── .env                    # Variáveis reais (NÃO subir pro git)
├── .env.example            # Template para equipe
├── tsconfig.json
├── package.json
└── TUTORIAL_PROJETO_NPM_BACKEND.md  # Este documento
```

---

## 2. Inicializar o Projeto

```bash
mkdir atividade-npm && cd atividade-npm
npm init -y
```

---

## 3. Instalar Dependências

```bash
# Produção
npm install express pg bcryptjs zod dotenv cors

# Desenvolvimento
npm install -D typescript tsx @types/node @types/express @types/pg
```

---

## 4. Configurar TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 5. Configurar `.env` e `.env.example`

**`.env.example`** (template — subir pro git):
```env
PORT=3000
# DATABASE_URL para CockroachDB Cloud
# Formato: postgresql://<usuario>:<senha>@<host>:26257/<banco>?sslmode=verify-full
# Exemplo: postgresql://dev:ENTER-SQL-USER-PASSWORD@geometrics-953.g8x.gcp-southamerica-east1.cockroachlabs.cloud:26257/utfpr-backend?sslmode=verify-full
DATABASE_URL="postgresql://<user>:<password>@<host>:26257/<database>?sslmode=verify-full"
```

**`.env`** (real — NÃO subir):
```env
PORT=3000
DATABASE_URL="postgresql://dev:SUA_SENHA_AQUI@geometrics-953.g8x.gcp-southamerica-east1.cockroachlabs.cloud:26257/utfpr-backend?sslmode=verify-full"
```

---
## 6. Conexão CockroachDB (`src/services/db.service.ts`)

O CockroachDB será conectado via **Cloud** (não via Docker local). A conexão é estabelecida usando o driver `pg` com a `DATABASE_URL` definida no arquivo `.env`.

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // O sslmode=verify-full é obrigatório para conexões Cloud CockroachDB
  ssl: DATABASE_URL.includes('sslmode=verify-full')
    ? { rejectUnauthorized: false }
    : false,
});
```
---

## 7. Validações (`src/validation/schemas.ts`)

```typescript
import { z } from 'zod';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const NICKNAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{2,40}$/;

export const registerSchema = z.object({
  email:     z.string().email('E-mail inválido').max(255),
  username:  z.string().min(3).max(50).regex(USERNAME_REGEX, 'Apenas letras, números e underline'),
  nickname:  z.string().min(2).max(50).regex(NICKNAME_REGEX, 'Caracteres inválidos'),
  password:  z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

---

## 8. Serviços de Autenticação (`src/services/auth.service.ts`)

```typescript
import bcrypt from 'bcryptjs';
import { pool } from './db.service';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const checkUniqueness = async (
  email: string, username: string, nickname: string, excludeId?: number,
): Promise<{ emailExists: boolean; usernameExists: boolean; nicknameExists: boolean }> => {
  const result = await pool.query(
    `SELECT id, email, username, nickname FROM users
     WHERE email = $1 OR username = $2 OR nickname = $3
     ${excludeId ? 'AND id != $4' : ''}`,
    excludeId ? [email, username, nickname, excludeId] : [email, username, nickname],
  );
  return {
    emailExists:    result.rows.some((r) => r.email === email),
    usernameExists: result.rows.some((r) => r.username === username),
    nicknameExists: result.rows.some((r) => r.nickname === nickname),
  };
};
```

---

## 9. Controlador `/login` (`src/controllers/auth.controller.ts`)

Arquivo central com **todas as operações CRUD** da rota `/login`:

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| `POST` | `/login` | `register` | Criar usuário (valida + hash senha + unicidade) |
| `GET` | `/login` | `listUsers` | Listar todos (sem senha) |
| `GET` | `/login/:id` | `getUser` | Buscar usuário específico |
| `PUT` | `/login/:id` | `updateUser` | Atualizar (aceita campos parciais + hash se trocar senha) |
| `DELETE` | `/login/:id` | `deleteUser` | Remover usuário |
| `POST` | `/login/verify` | `verifyLogin` | Autenticar (compara bcrypt) |

```typescript
import { Request, Response } from 'express';
import { registerSchema } from '../validation/schemas';
import { hashPassword, comparePassword, checkUniqueness } from '../services/auth.service';
import { pool } from '../services/db.service';

// POST /login — Criar/Registrar usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Validação falhou', details: parse.error.errors }); return; }

  const { email, username, nickname, password } = parse.data;

  const { emailExists, usernameExists, nicknameExists } = await checkUniqueness(email, username, nickname);
  if (emailExists || usernameExists || nicknameExists) {
    res.status(409).json({ error: 'Conflito: campos já em uso', details: { email: emailExists, username: usernameExists, nickname: nicknameExists } });
    return;
  }

  const password_hash = await hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (email, username, nickname, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, username, nickname, created_at`,
    [email, username, nickname, password_hash],
  );
  res.status(201).json(result.rows[0]);
};

// GET /login — Listar usuários (sem senha)
export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  const result = await pool.query(`SELECT id, email, username, nickname, created_at FROM users ORDER BY created_at DESC`);
  res.status(200).json(result.rows);
};

// GET /login/:id — Ver usuário específico
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const numericId = Number(req.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) { res.status(400).json({ error: 'ID inválido' }); return; }
  const result = await pool.query(`SELECT id, email, username, nickname, created_at FROM users WHERE id = $1`, [numericId]);
  if (result.rowCount === 0) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  res.status(200).json(result.rows[0]);
};

// PUT /login/:id — Atualizar usuário
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const numericId = Number(req.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) { res.status(400).json({ error: 'ID inválido' }); return; }

  const parse = registerSchema.partial().safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Validação falhou', details: parse.error.errors }); return; }

  const fields = parse.data as Partial<Record<'email' | 'username' | 'nickname' | 'password', string>>;
  const setParts: string[] = []; const values: unknown[] = []; let idx = 1;

  if (fields.email)    { setParts.push(`email = $${idx++}`);    values.push(fields.email); }
  if (fields.username) { setParts.push(`username = $${idx++}`); values.push(fields.username); }
  if (fields.nickname) { setParts.push(`nickname = $${idx++}`); values.push(fields.nickname); }
  if (fields.password) { const hash = await hashPassword(fields.password); setParts.push(`password_hash = $${idx++}`); values.push(hash); }

  if (setParts.length === 0) { res.status(400).json({ error: 'Nenhum campo para atualizar' }); return; }

  values.push(numericId);
  const sql = `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, email, username, nickname`;
  const result = await pool.query(sql, values);
  if (result.rowCount === 0) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  res.status(200).json(result.rows[0]);
};

// DELETE /login/:id — Deletar usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const numericId = Number(req.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) { res.status(400).json({ error: 'ID inválido' }); return; }
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [numericId]);
  if (result.rowCount === 0) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  res.status(200).json({ message: 'Usuário deletado com sucesso' });
};

// POST /login/verify — Verificar login
export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: 'Email e senha são obrigatórios' }); return; }

  const result = await pool.query(`SELECT id, email, username, nickname, password_hash FROM users WHERE email = $1`, [email]);
  if (result.rowCount === 0) { res.status(401).json({ error: 'Credenciais inválidas' }); return; }

  const user = result.rows[0];
  if (!await comparePassword(password, user.password_hash)) { res.status(401).json({ error: 'Credenciais inválidas' }); return; }

  res.status(200).json({ message: 'Login realizado com sucesso', user: { id: user.id, email: user.email, username: user.username, nickname: user.nickname } });
};
```

---

## 10. Rotas `/login` (`src/routes/auth.routes.ts`)

```typescript
import { Router } from 'express';
import { register, listUsers, getUser, updateUser, deleteUser, verifyLogin } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/login', register);       // POST /login — Criar
authRouter.get('/login', listUsers);       // GET /login — Listar
authRouter.get('/login/:id', getUser);     // GET /login/:id — Ler 1
authRouter.put('/login/:id', updateUser);  // PUT /login/:id — Atualizar
authRouter.delete('/login/:id', deleteUser); // DELETE /login/:id — Deletar
authRouter.post('/login/verify', verifyLogin); // POST /login/verify — Autenticar
```

---

## 11. Aplicação Express (`src/app.ts`)

```typescript
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

// Home redireciona para a rota de login (frontend React consome /api/login)
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.use('/api', authRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(errorMiddleware);
```

---

## 12. Middleware de Erros (`src/middleware/error.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Erro interno' });
};
```

---

## 13. Ponto de Entrada (`src/server.ts`)

```typescript
import dotenv from 'dotenv';
import { pool } from './services/db.service';
import { app } from './app';

dotenv.config();
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await pool.query(`SELECT 1`);
    console.log('✅ Conectado ao CockroachDB');
    app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Falha ao conectar ao banco:', err);
    process.exit(1);
  }
};
start();
```

---

## 14. Home → Login (`public/index.html`)

Página inicial que redireciona automaticamente para `/api/login` após 3 segundos, com link manual:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UTFPR Backend - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #1a1a2e; color: #eee; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #e94560; }
    p { color: #aaa; margin-bottom: 2rem; }
    a { display: inline-block; padding: 0.75rem 2rem; background: #e94560; color: #fff; text-decoration: none; border-radius: 8px; font-size: 1.1rem; transition: background 0.2s; }
    a:hover { background: #c73650; }
  </style>
</head>
<body>
  <h1>UTFPR Backend</h1>
  <p>Sistema de autenticação com CockroachDB</p>
  <a href="/api/login">Ir para Login</a>
  <script>setTimeout(() => { window.location.href = '/api/login'; }, 3000);</script>
</body>
</html>
```

---

## 15. Scripts no `package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 16. Criar Tabela no CockroachDB (uma vez)

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 17. Executar o Projeto

```bash
npm run dev
```

---

## 18. Testar as Operações `/login` (curl)

### POST /login — Registrar
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@utfpr.edu.br","username":"utfpr_aluno","nickname":"Aluno UTFPR","password":"senha123"}'
```

### GET /login — Listar
```bash
curl http://localhost:3000/api/login
```

### GET /login/:id — Buscar um
```bash
curl http://localhost:3000/api/login/1
```

### PUT /login/:id — Atualizar
```bash
curl -X PUT http://localhost:3000/api/login/1 \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Aluno Atualizado"}'
```

### DELETE /login/:id — Deletar
```bash
curl -X DELETE http://localhost:3000/api/login/1
```

### POST /login/verify — Autenticar
```bash
curl -X POST http://localhost:3000/api/login/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@utfpr.edu.br","password":"senha123"}'
```

---

## 19. Conexão CockroachDB Cloud

1. Crie cluster gratuito em [cockroachlabs.com](https://www.cockroachlabs.com/)
2. Copie a connection string (contém `sslmode=verify-full`)
3. Cole no `.env` como `DATABASE_URL`
4. **⚠️** O `.env` real nunca é commitado — use `.env.example` como referência

---

## 20. Validações Realizadas

| Campo | Validação |
|-------|-----------|
| `email` | Formato obrigatório (zod `.email()`) |
| `username` | Regex `/^[a-zA-Z0-9_]{3,30}$/`, **único no banco** |
| `nickname` | Regex `/^[a-zA-ZÀ-ÿ\s]{2,40}$/`, **único no banco** |
| `password` | Mínimo 6 caracteres, armazenado com hash bcrypt (salt 12) |

---

## Docker

> **Nota:** Este projeto foi desenhado para usar CockroachDB **na nuvem** (Cloud), não via Docker local. Isso simplifica o setup — basta configurar a `DATABASE_URL` no arquivo `.env` com a string de conexão fornecida pelo CockroachDB Labs.

<Br/>As informações anteriormente sobre Docker (Dockerfile, docker-compose.yml, etc.) foram removidas pois a conexão é feita diretamente com o banco na nuvem usando o driver `pg` e a `DATABASE_URL` do `.env`.
<Br/>Para referência histórica, o `docker-compose.yml` original orquestrava um container `cockroachdb` local e um `init-db` para criar a tabela `users`, mas a abordagem recomendada é usar a instância gerenciada em nuvem.
```bash
docker-compose restart backend
```

docker-compose up -d
        │
        ▼
┌──────────────────┐    ┌──────────────────────┐
│  cockroachdb      │    │  backend               │
│  (port 26257/8080)│    │  (port 3000)            │
│  CockroachDB      │◄───│  Express + TS           │
│  Inicia com DB    │    │  Conecta via DATABASE_URL│
└──────────────────┘    └──────────────────────┘
        │                       │
        ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  init-db          │    │  POST /login (criar)  │
│  Cria tabela      │    │  GET /login (listar)  │
│  users            │    │  PUT /login/:id       │
└──────────────────┘    │  DELETE /login/:id    │
                        └──────────────────────┘
```

---

## Próximos Passos

- [ ] Adicionar autenticação JWT após o login
- [ ] Adicionar rate limiting na rota `/login`
- [ ] Adicionar testes com Jest/Supertest
- [ ] Frontend React consumindo a API (`fetch`/`axios`)

---

> **Dica:** O CockroachDB é PostgreSQL-compatible, então usa o driver `pg` — a mesma lib usada em qualquer projeto Node + PostgreSQL. A diferença está na connection string e no `sslmode=verify-full` obrigatório para conexões Cloud. Para se conectar, basta configurar a `DATABASE_URL` no arquivo `.env` com a string fornecida pelo CockroachDB Labs.
