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

EXPOSE 3000

# CMD ["./scripts/init.sh"]
# CMD ["/bin/bash", "/nreportapi/scripts/init.sh"]
CMD ["/bin/bash", "./scripts/init.sh"]
