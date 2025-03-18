# N-Report API

Uma aplicação onde você pode alertar crimes em uma determinada localização.

## 📋 Descrição

N-Report API é um sistema backend desenvolvido em TypeScript que permite aos usuários reportar e gerenciar ocorrências de crimes em diferentes localizações. O sistema possui autenticação, gerenciamento de usuários, delegacias e ocorrências.

## 🚀 Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT para autenticação
- Multer para upload de arquivos
- Docker e Docker Compose

## 🛠️ Pré-requisitos

- Node.js (versão LTS recomendada)
- Docker e Docker Compose
- PostgreSQL
- Git

## ⚙️ Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/leandrosuy2/n-report-api
cd n-report-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis de acordo com seu ambiente:
  ```
  PORT=3000
  NODE_ENV="development"
  DATABASE_URL="postgresql://user:password@db-postgres:5432/databaseName?schema=public"
  KEY_SECRET=sua_chave_secreta_jwt
  ```

4. Inicie os containers Docker:
```bash
docker-compose up -d
```

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

## 🚀 Executando o Projeto

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## 📌 Rotas da API

### Autenticação
- POST `/auth/login` - Login de usuário
- POST `/auth/register` - Registro de novo usuário

### Usuários
- GET `/users` - Lista todos os usuários
- GET `/users/:id` - Obtém um usuário específico
- PUT `/users/:id` - Atualiza um usuário
- DELETE `/users/:id` - Remove um usuário

### Delegacias
- GET `/police-stations` - Lista todas as delegacias
- POST `/police-stations` - Cria uma nova delegacia
- GET `/police-stations/:id` - Obtém uma delegacia específica
- PUT `/police-stations/:id` - Atualiza uma delegacia
- DELETE `/police-stations/:id` - Remove uma delegacia

### Ocorrências
- GET `/occurrences` - Lista todas as ocorrências
- POST `/occurrences` - Registra uma nova ocorrência
- GET `/occurrences/:id` - Obtém uma ocorrência específica
- PUT `/occurrences/:id` - Atualiza uma ocorrência
- DELETE `/occurrences/:id` - Remove uma ocorrência

### Imagens
- POST `/images/upload` - Upload de uma nova imagem (requer autenticação)
- GET `/images/my-images` - Lista todas as imagens do usuário logado
- GET `/images/:id` - Obtém uma imagem específica do usuário logado
- PUT `/images/:id` - Atualiza uma imagem existente do usuário logado
- DELETE `/images/:id` - Remove uma imagem do usuário logado

### Permissões
- GET `/permissions` - Lista todas as permissões
- POST `/permissions` - Cria uma nova permissão
- PUT `/permissions/:id` - Atualiza uma permissão
- DELETE `/permissions/:id` - Remove uma permissão

## 🔐 Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Para acessar rotas protegidas, inclua o token no header da requisição:

```
Authorization: Bearer seu_token_jwt
```

## 📁 Estrutura do Projeto

```
src/
├── @types/         # Definições de tipos TypeScript
├── app/           # Configurações da aplicação
├── config/        # Configurações gerais
├── controllers/   # Controladores da aplicação
├── database/      # Configurações do banco de dados
├── middlewares/   # Middlewares da aplicação
├── models/        # Modelos de dados
├── routers/       # Definição das rotas
└── utils/         # Utilitários e helpers
```

## 👥 Contribuidores

- Leandro Dantas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Reportando Problemas

Se você encontrar algum problema, por favor, abra uma issue em:
https://github.com/leandrosuy2/n-report-api/issues

## 📡 Exemplos de Requisições (cURL)

### Autenticação

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu.email@exemplo.com",
    "password": "sua_senha"
  }'
```

**Registro:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Completo",
    "email": "seu.email@exemplo.com",
    "password": "sua_senha",
    "phoneNumber": "83999999999"
  }'
```

### Usuários

**Listar Usuários:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer seu_token_jwt"
```

**Obter Usuário Específico:**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Usuário:**
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Nome",
    "email": "novo.email@exemplo.com",
    "phoneNumber": "83999999999"
  }'
```

**Deletar Usuário:**
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

### Delegacias

**Listar Delegacias:**
```bash
curl -X GET http://localhost:3000/police-stations \
  -H "Authorization: Bearer seu_token_jwt"
```

**Criar Delegacia:**
```bash
curl -X POST http://localhost:3000/police-stations \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome da Delegacia",
    "address": "Endereço da Delegacia",
    "phoneNumber": "83999999999",
    "latitude": -7.123456,
    "longitude": -34.123456
  }'
```

**Obter Delegacia Específica:**
```bash
curl -X GET http://localhost:3000/police-stations/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Delegacia:**
```bash
curl -X PUT http://localhost:3000/police-stations/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Nome da Delegacia",
    "address": "Novo Endereço",
    "phoneNumber": "83999999999",
    "latitude": -7.123456,
    "longitude": -34.123456
  }'
```

**Deletar Delegacia:**
```bash
curl -X DELETE http://localhost:3000/police-stations/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

### Ocorrências

**Listar Ocorrências:**
```bash
curl -X GET http://localhost:3000/occurrences \
  -H "Authorization: Bearer seu_token_jwt"
```

**Criar Ocorrência:**
```bash
curl -X POST http://localhost:3000/occurrences \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título da Ocorrência",
    "description": "Descrição detalhada da ocorrência",
    "latitude": -7.123456,
    "longitude": -34.123456,
    "date": "2024-03-18T10:00:00Z",
    "type": "ROUBO"
  }'
```

**Obter Ocorrência Específica:**
```bash
curl -X GET http://localhost:3000/occurrences/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Ocorrência:**
```bash
curl -X PUT http://localhost:3000/occurrences/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Título",
    "description": "Nova descrição",
    "latitude": -7.123456,
    "longitude": -34.123456,
    "date": "2024-03-18T10:00:00Z",
    "type": "ROUBO"
  }'
```

**Deletar Ocorrência:**
```bash
curl -X DELETE http://localhost:3000/occurrences/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

### Imagens

**Upload de Imagem:**
```bash
curl -X POST http://localhost:3000/images/upload \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "image=@/caminho/para/sua/imagem.jpg"
```

**Listar Minhas Imagens:**
```bash
curl -X GET http://localhost:3000/images/my-images \
  -H "Authorization: Bearer seu_token_jwt"
```

**Obter Imagem Específica:**
```bash
curl -X GET http://localhost:3000/images/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Imagem:**
```bash
curl -X PUT http://localhost:3000/images/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "image=@/caminho/para/nova/imagem.jpg"
```

**Deletar Imagem:**
```bash
curl -X DELETE http://localhost:3000/images/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

### Permissões

**Listar Permissões:**
```bash
curl -X GET http://localhost:3000/permissions \
  -H "Authorization: Bearer seu_token_jwt"
```

**Criar Permissão:**
```bash
curl -X POST http://localhost:3000/permissions \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ADMIN",
    "description": "Permissão de administrador"
  }'
```

**Atualizar Permissão:**
```bash
curl -X PUT http://localhost:3000/permissions/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "USER",
    "description": "Permissão de usuário comum"
  }'
```

**Deletar Permissão:**
```bash
curl -X DELETE http://localhost:3000/permissions/1 \
  -H "Authorization: Bearer seu_token_jwt"
```
