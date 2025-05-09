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
- GET `/api/v1/occurrences` - Lista todas as ocorrências
- POST `/api/v1/occurrences/quick` - Registra uma ocorrência rápida (apenas latitude e longitude)
- POST `/api/v1/occurrences/save` - Registra uma ocorrência completa (apenas latitude e longitude são obrigatórios)
- GET `/api/v1/occurrences/:id` - Obtém uma ocorrência específica
- PUT `/api/v1/occurrences/:id` - Atualiza uma ocorrência (apenas latitude e longitude são obrigatórios)
- DELETE `/api/v1/occurrences/:id` - Remove uma ocorrência

### Imagens
- POST `/api/v1/images/upload` - Upload de uma nova imagem (requer autenticação)
- GET `/api/v1/images/my-images` - Lista todas as imagens do usuário logado
- GET `/api/v1/images/:id` - Obtém uma imagem específica do usuário logado
- PUT `/api/v1/images/:id` - Atualiza uma imagem existente do usuário logado
- DELETE `/api/v1/images/:id` - Remove uma imagem do usuário logado

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
curl -X GET http://localhost:3000/api/v1/ocurrences \
  -H "Authorization: Bearer seu_token_jwt"
```

**Criar Ocorrência Rápida (Apenas Localização):**
```bash
curl -X POST http://localhost:3000/api/v1/ocurrences/quick \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.123456,    # Obrigatório
    "longitude": -34.123456   # Obrigatório
  }'
```

**Criar Ocorrência Completa:**
```bash
curl -X POST http://localhost:3000/api/v1/ocurrences/save \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.123456,    # Obrigatório
    "longitude": -34.123456,  # Obrigatório
    "title": "Título da Ocorrência",        # Opcional
    "description": "Descrição detalhada",   # Opcional
    "date": "2024-03-18T10:00:00Z",        # Opcional (data atual se não informada)
    "type": "ROUBO"                        # Opcional
  }'
```

**Obter Ocorrência Específica:**
```bash
curl -X GET http://localhost:3000/api/v1/ocurrences/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Ocorrência (Mínimo):**
```bash
curl -X PUT http://localhost:3000/api/v1/ocurrences/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.123456,    # Obrigatório
    "longitude": -34.123456   # Obrigatório
  }'
```

**Atualizar Ocorrência (Completa):**
```bash
curl -X PUT http://localhost:3000/api/v1/ocurrences/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.123456,    # Obrigatório
    "longitude": -34.123456,  # Obrigatório
    "title": "Novo Título",                 # Opcional
    "description": "Nova descrição",        # Opcional
    "date": "2024-03-18T10:00:00Z",        # Opcional
    "type": "ROUBO"                        # Opcional
  }'
```

**Deletar Ocorrência:**
```bash
curl -X DELETE http://localhost:3000/api/v1/ocurrences/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

### Imagens

**Upload de Imagem:**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "image=@/caminho/para/sua/imagem.jpg"
```

**Listar Minhas Imagens:**
```bash
curl -X GET http://localhost:3000/api/v1/images/my-images \
  -H "Authorization: Bearer seu_token_jwt"
```

**Obter Imagem Específica:**
```bash
curl -X GET http://localhost:3000/api/v1/images/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Atualizar Imagem:**
```bash
curl -X PUT http://localhost:3000/api/v1/images/1 \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "image=@/caminho/para/nova/imagem.jpg"
```

**Deletar Imagem:**
```bash
curl -X DELETE http://localhost:3000/api/v1/images/1 \
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
    "name": "ADMIN",
    "description": "Permissão de administrador"
  }'
```

**Deletar Permissão:**
```bash
curl -X DELETE http://localhost:3000/permissions/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

## 🔑 Autenticação

### Criar Conta (Sign Up)
```bash
curl --location 'http://localhost:3000/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Usuario",
    "email": "usuario@email.com",
    "password": "12345672",
    "cpf": "22222222222"
}'
```

### Login
```bash
curl --location 'http://localhost:3000/auth/signin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "usuario@email.com",
    "password": "12345672"
}'
```

## 📝 Ocurrences (Ocorrências)

### Criar Ocorrência Rápida
```bash
curl --location 'http://localhost:3000/api/v1/ocurrences/quick' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu_token_aqui' \
--data '{
    "latitude": -23.550520,
    "longitude": -46.633308
}'
```

### Criar Ocorrência Completa
```bash
curl --location 'http://localhost:3000/api/v1/ocurrences' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu_token_aqui' \
--data '{
    "title": "Título da Ocorrência",
    "description": "Descrição detalhada",
    "type": "Crime",
    "latitude": -23.550520,
    "longitude": -46.633308,
    "date": "2024-03-18",
    "time": "14:30"
}'
```

### Listar Todas as Ocorrências
```bash
curl --location 'http://localhost:3000/api/v1/ocurrences' \
--header 'Authorization: Bearer seu_token_aqui'
```

### Listar Minhas Ocorrências
```bash
curl --location 'http://localhost:3000/api/v1/ocurrences/self' \
--header 'Authorization: Bearer seu_token_aqui'
```

### Buscar Ocorrência por ID
```bash
curl --location 'http://localhost:3000/api/v1/ocurrences/{id}' \
--header 'Authorization: Bearer seu_token_aqui'
```

### Atualizar Ocorrência
```bash
curl --location --request PUT 'http://localhost:3000/api/v1/ocurrences/{id}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu_token_aqui' \
--data '{
    "title": "Novo Título",
    "description": "Nova Descrição",
    "resolved": true
}'
```

### Deletar Ocorrência
```bash
curl --location --request DELETE 'http://localhost:3000/api/v1/ocurrences/{id}' \
--header 'Authorization: Bearer seu_token_aqui'
```

## 👮 Delegacias

### Listar Delegacias
```bash
curl --location 'http://localhost:3000/api/v1/police-stations' \
--header 'Authorization: Bearer seu_token_aqui'
```

### Criar Delegacia
```bash
curl --location 'http://localhost:3000/api/v1/police-stations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu_token_aqui' \
--data '{
    "name": "1ª Delegacia",
    "email": "delegacia@email.com",
    "phone": "11999999999",
    "latitude": -23.550520,
    "longitude": -46.633308
}'
```

## 👤 Usuários

### Atualizar Perfil
```bash
curl --location --request PUT 'http://localhost:3000/api/v1/users/profile' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu_token_aqui' \
--data '{
    "name": "Novo Nome",
    "email": "novo@email.com"
}'
```

### Upload de Avatar
```bash
curl --location 'http://localhost:3000/api/v1/users/avatar' \
--header 'Authorization: Bearer seu_token_aqui' \
--form 'avatar=@"/caminho/para/imagem.jpg"'
```

## 🔐 Credenciais Padrão

### Usuário Admin