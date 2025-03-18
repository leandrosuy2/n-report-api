FROM node:18

WORKDIR /nreportapi

# Instala o netcat para verificar disponibilidade do banco
RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

RUN npm install
RUN chmod +x ./scripts/init.sh

COPY . .

EXPOSE 3000

CMD ["./scripts/init.sh"]