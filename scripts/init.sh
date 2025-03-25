#!/bin/bash

# Função para testar conexão com o banco
wait_for_db() {
  echo "🔄 Aguardando o banco de dados..."
  while ! nc -z db-postgres 5432; do
    sleep 1
  done
  echo "✅ Banco de dados está pronto!"
}

# Espera o banco estar pronto
wait_for_db

# Limpa o volume do banco se necessário
if [ "$RESET_DB" = "true" ]; then
  echo "🔄 Resetando o banco de dados..."
  npx prisma migrate reset --force
fi

# Setup do banco de dados
echo "🔄 Configurando banco de dados..."
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma db seed

# Inicia a aplicação
echo "🚀 Iniciando a aplicação..."
npm start
