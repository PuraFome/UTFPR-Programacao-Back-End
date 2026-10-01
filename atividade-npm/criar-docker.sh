mkdir -p /tmp/scripts

cat > /tmp/scripts/create_table.sql << 'EOF'
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

cat > /tmp/scripts/create_test_data.sql << 'EOF'
-- Insere alguns dados de teste (opcional)
INSERT INTO users (email, username, nickname, password_hash) VALUES
  ('admin@utfpr.edu.br', 'admin', 'Admin UTFPR', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmuilu'),
  ('user@utfpr.edu.br', 'user', 'Usuário UTFPR', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmuilu')
ON CONFLICT (email) DO NOTHING;
EOF

# Mostra URLs

echo "========== Docker Compose Setup =========="
echo ""
echo "1. Inicie os containers:"
echo "   docker-compose up -d"
echo ""
echo "2. Faça login no CockroachDB via CLI:"
echo "   docker exec -it cockroachdb psql 'postgresql://root@cockroachdb:26257/utfpr?sslmode=disable'"
echo ""
echo "3. Acesse o Console Web do CockroachDB:"
echo "   http://localhost:8080"
echo ""
echo "4. Acesse a API Node.js:"
echo "   http://localhost:3000/"
echo ""
echo "5. Teste a rota /login (POST):"
echo "   curl -X POST http://localhost:3000/api/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@utfpr.edu.br\",\"username\":\"admin\",\"nickname\":\"Admin UTFPR\",\"password\":\"admin123\"}'"
echo ""
echo "6. Encerre os containers:"
echo "   docker-compose down -v"
echo ""
echo "========== Scripts criadas em /tmp/scripts/ =========="