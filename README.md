# API Node - Autenticação e Gerenciamento de Usuários

Uma API RESTful construída com Node.js, Express e MongoDB para autenticação de usuários e gerenciamento de dados com segurança em via JWT.

---

## 📋 Características

- ✅ **Autenticação segura** com JWT (JSON Web Tokens)
- 🔐 **Criptografia de senhas** com bcrypt (salt 10)
- 🗄️ **Banco de dados MongoDB** via Prisma ORM
- 📦 **ORM moderno** com Prisma para type-safety
- 🛡️ **Rotas públicas e privadas** separadas com middleware de autenticação
- ⚡ **Express.js v5** para performance
- 📝 **Validação de entrada** nos endpoints

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Node.js** | 24.11.0+ | Runtime JavaScript |
| **Express** | 5.2.1 | Framework web |
| **Prisma** | 6.19.3 | ORM MongoDB |
| **bcrypt** | 6.0.0 | Hash de senhas |
| **JWT** | 9.0.3 | Autenticação |
| **dotenv** | 17.4.2 | Variáveis de ambiente |
| **MongoDB** | - | Banco de dados NoSQL |

---

## ⚙️ Configuração Inicial

### 1. **Clonar o repositório**
```bash
git clone https://github.com/jeanramalho/apiNode.git
cd apiNode
```

### 2. **Instalar dependências**
```bash
npm install
```

### 3. **Configurar variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/banco?appName=Users"
JWT_SECRET="sua_chave_secreta_super_complexa"
```

**Obtendo a `DATABASE_URL`:**
- Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crie um cluster ou use um existente
- Gere uma string de conexão no formato: `mongodb+srv://usuario:senha@host/database`
- ⚠️ Caracteres especiais na senha devem ser URL-encoded (ex: `#` vira `%23`)

**Gerando uma `JWT_SECRET` segura:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. **Sincronizar banco de dados**
```bash
npm run prisma:push
```

---

## 🚀 Iniciando o Servidor

### Modo de desenvolvimento (com auto-reload)
```bash
npm run dev
```

Saída esperada:
```
Servidor rodando na porta 3000
```

### Modo produção
```bash
npm start
```

---

## 📡 Endpoints da API

### **Rotas Públicas** (sem autenticação)

#### 1. Cadastro de Usuário
```http
POST /cadastro
Content-Type: application/json

{
  "nome": "Jean Ramalho",
  "email": "jean@example.com",
  "password": "senha123"
}
```

**Resposta (201 - Criado):**
```json
{
  "message": "Usuário criado com sucesso!",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jean Ramalho",
    "email": "jean@example.com"
  }
}
```

**Validações:**
- `nome` ou `name` são obrigatórios (aceita ambos os nomes)
- `email` é obrigatório e único no banco
- `password` é obrigatório (mínimo 1 caractere)

**Erros possíveis:**
- `400` - Campos obrigatórios faltando
- `500` - Email duplicado ou erro no servidor

---

#### 2. Login
```http
POST /login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "senha123"
}
```

**Resposta (200 - Sucesso):**
```json
{
  "message": "Login realizado com sucesso!",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jean Ramalho",
    "email": "jean@example.com",
    "password": "$2b$10$..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Como usar o token:**
Inclua o token no header de todas as requisições privadas:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Erros possíveis:**
- `404` - Usuário não encontrado
- `400` - Senha incorreta

---

### **Rotas Privadas** (requer autenticação via JWT)

#### 3. Listar Usuários
```http
GET /private/list
Authorization: Bearer SEU_TOKEN_JWT
```

**Resposta (200 - Sucesso):**
```json
{
  "message": "Usuários listados com sucesso!",
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jean Ramalho",
      "email": "jean@example.com",
      "password": "$2b$10$..."
    }
  ]
}
```

**Erros possíveis:**
- `401` - Token ausente ou inválido
- `400` - Token expirado (expira em 1 minuto)

---

## 🔐 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                    │
└─────────────────────────────────────────────────────────────┘

1. CADASTRO
   ┌─────────────────────┐
   │ POST /cadastro      │
   │ {nome, email, pwd}  │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │ Hash senha com bcrypt (s:10) │
   │ Salvar no MongoDB            │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────┐
   │ 201 Created ✓   │
   └─────────────────┘

2. LOGIN
   ┌────────────────────┐
   │ POST /login        │
   │ {email, password}  │
   └──────────┬─────────┘
              │
              ▼
   ┌──────────────────────────────┐
   │ Busca user por email         │
   │ Compara senha com bcrypt     │
   └──────────┬───────────────────┘
              │
              ▼
   ┌────────────────────────────┐
   │ Gera JWT:                   │
   │ {id: user.id, exp: 1min}   │
   └──────────┬─────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │ 200 OK               │
   │ + Token retornado    │
   └──────────────────────┘

3. ACESSO A ROTA PRIVADA
   ┌─────────────────────────────────────────┐
   │ GET /private/list                       │
   │ Authorization: Bearer <token>           │
   └──────────┬────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Middleware verifica:                  │
   │ - Token existe?                       │
   │ - JWT válido e não expirado?         │
   │ - Extrai userId                       │
   └──────────┬───────────────────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │ ✓ Acesso permitido      │
   │ Executa rota            │
   └─────────────────────────┘
```

---

## 📂 Estrutura do Projeto

```
apiNode/
├── server.js                    # Entry point da aplicação
├── package.json                 # Dependências e scripts
├── .env                         # Variáveis de ambiente
├── .gitignore                   # Arquivos ignorados pelo git
├── README.md                    # Este arquivo
│
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── ...
│
├── routes/
│   ├── public.js               # Rotas de cadastro e login
│   ├── private.js              # Rotas autenticadas
│   └── ...
│
├── middlewares/
│   ├── auth.js                 # Validação de JWT
│   └── ...
│
└── generated/
    └── prisma/                 # Client Prisma gerado automaticamente
```

---

## 🗄️ Estrutura do Banco de Dados

### Coleção: `User`

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `_id` | ObjectId | Primary Key | Identificador único (MongoDB) |
| `email` | String | Unique | Email do usuário |
| `name` | String | Required | Nome completo |
| `password` | String | Required | Senha hasheada com bcrypt |

**Exemplo de documento:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "jean@example.com",
  "name": "Jean Ramalho",
  "password": "$2b$10$3pK33wnvTqlTpZU2JRsnGOgu4IiwvFJnLKIg5R/aWjW2V9jytXejW"
}
```

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento com auto-reload
npm run dev

# Servidor em produção
npm start

# Visualizar dados no Prisma Studio (interface web)
npm run prisma:studio

# Sincronizar schema com banco
npm run prisma:push
```

---

## 🔑 Variáveis de Ambiente

| Variável | Tipo | Exemplo | Descrição |
|----------|------|---------|-----------|
| `DATABASE_URL` | String | `mongodb+srv://...` | String de conexão MongoDB |
| `JWT_SECRET` | String | `3f6d432...` | Chave para assinar tokens JWT |

**⚠️ Segurança:**
- Nunca commite o arquivo `.env` no repositório
- Use diferentes `JWT_SECRET` para desenvolvimento e produção
- Regenere `JWT_SECRET` periodicamente em produção
- A `DATABASE_URL` deve ter senhas fortes e caracteres especiais URL-encoded

---

## 🐛 Observações Importantes

### 1. **Duração do Token JWT**
O token expira em **1 minuto**. Para endpoints privados, você precisa fazer login novamente após expiração.

```javascript
// Em routes/public.js
const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '1m'})
```

Para aumentar, mude para:
```javascript
{expiresIn: '24h'}  // 24 horas
```

### 2. **Senha Retornada no Login**
O endpoint `/login` retorna a senha hasheada do usuário. Isso é normal (hash não pode ser reverso), mas em produção você pode querer remover esse campo sensível.

### 3. **Listagem de Usuários Pública**
A rota `/private/list` retorna dados completos de todos os usuários, incluindo hashes de senha. Considere paginar ou restringir em produção.

### 4. **Instâncias do Prisma Client**
Cada arquivo de rota cria uma nova instância de `PrismaClient()`. Em produção, é melhor usar uma instância singleton.

```javascript
// Padrão recomendado (criar prisma/client.ts):
export const prisma = new PrismaClient()

// Usar em todas as rotas:
import { prisma } from '../prisma/client'
```

### 5. **Validação de Email**
Não há validação de formato de email. Considere adicionar:
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
    return res.status(400).json({message: 'Email inválido'})
}
```

### 6. **Força de Senha**
Não há validação de força de senha. Em produção, implemente:
- Mínimo 8 caracteres
- Pelo menos 1 número
- Pelo menos 1 caractere especial

---

## 🧪 Testando os Endpoints

### Com cURL

```bash
# 1. Cadastrar usuário
curl -X POST http://localhost:3000/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Jean Ramalho",
    "email": "jean@example.com",
    "password": "senha123"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "senha123"
  }'

# 3. Acessar rota privada (substitua TOKEN pelo retornado no login)
curl -X GET http://localhost:3000/private/list \
  -H "Authorization: Bearer TOKEN"
```

### Com Insomnia ou Postman

1. Importe a coleção ou crie manualmente:
   - **POST** http://localhost:3000/cadastro
   - **POST** http://localhost:3000/login
   - **GET** http://localhost:3000/private/list (com header `Authorization: Bearer <token>`)

2. No Postman, você pode usar **variáveis** para salvar o token:
   - Após login, acesse a aba `Tests` e adicione:
     ```javascript
     pm.environment.set("token", pm.response.json().token)
     ```
   - Depois use `{{token}}` no header de rotas privadas

---

## 📚 Dependências Explicadas

### express
Framework web minimalista e poderoso para Node.js. Gerencia rotas, middlewares e requisições HTTP.

### @prisma/client
Cliente gerado automaticamente do Prisma. Fornece métodos type-safe para consultar o MongoDB.

### bcrypt
Biblioteca de criptografia para hash seguro de senhas. O `salt: 10` significa 2^10 iterações.

### jsonwebtoken
Cria e valida JWT. Usado para autenticação stateless (sem sessão no servidor).

### dotenv
Carrega variáveis de `.env` para `process.env`. Essencial para dados sensíveis.

---

## 🚀 Deploy (Dicas)

Para colocar em produção:

1. **Variáveis de ambiente seguras**
   - Use serviço como GitHub Secrets ou variáveis no Heroku/Vercel
   - Nunca commite `.env`

2. **Port variável**
   ```javascript
   const PORT = process.env.PORT || 3000
   app.listen(PORT, () => console.log(`Servidor em porta ${PORT}`))
   ```

3. **HTTPS em produção**
   - Configure reverse proxy (Nginx)
   - Ou use serviço como Vercel que gerencia SSL

4. **Rate limiting**
   - Adicione express-rate-limit para prevenir brute force
   ```bash
   npm install express-rate-limit
   ```

5. **Monitoramento**
   - Configure logs (Winston, Pino)
   - Monitore erros em tempo real

---

## 📧 Contato e Suporte

- **Autor:** Jean Ramalho
- **Email:** jeanramalho.dev@gmail.com
- **GitHub:** https://github.com/jeanramalho/apiNode

---

## 📄 Licença

ISC - veja LICENSE para detalhes.

---

**Última atualização:** 14 de Abril de 2026
