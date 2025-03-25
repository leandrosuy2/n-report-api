FROM node:18

WORKDIR /nreportapi

# Instala o netcat para verificar disponibilidade do banco
RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

RUN npm install
RUN chmod +x ./scripts/init.sh

# Criar diretório de uploads e definir permissões
RUN mkdir -p uploads && chown -R node:node uploads && chmod 755 uploads

COPY . .

# Converter line endings para Unix
RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix ./scripts/init.sh

EXPOSE 3000

CMD ["/bin/bash", "./scripts/init.sh"]
