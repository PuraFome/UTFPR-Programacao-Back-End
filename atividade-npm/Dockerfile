# Dockerfile para Backend Node.js + TypeScript + CockroachDB
# Multi-stage build para produção

FROM node:22-alpine AS builder

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm ci --omit=dev

# Copia código fonte
COPY src/ ./src/
COPY tsconfig.json ./

# Compila TypeScript
RUN npx tsc

# Etapa de produção - imagem final
FROM node:22-alpine AS prod

WORKDIR /app

# Copia apenas o necessário para produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Cria usuario não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]