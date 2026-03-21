# ResuMatch · Backend

API REST em Node.js + Express com autenticação JWT, MySQL e análise ATS via Gemini.

---

## Estrutura

```
src/
├── config/
│   ├── index.js          ← variáveis de ambiente validadas
│   └── errors.js         ← classes de erro customizadas
├── db/
│   ├── connection.js     ← pool MySQL serverless-safe
│   └── userRepository.js ← queries de usuário e refresh tokens
├── middleware/
│   ├── security.js       ← helmet, cors, rate limiter, logger
│   ├── requireAuth.js    ← guard JWT para rotas protegidas
│   ├── validate.js       ← validação do body de /analyze
│   └── errorHandler.js   ← handler central de erros
├── routes/
│   ├── auth.js           ← /api/auth/*
│   └── analyze.js        ← /api/analyze
├── services/
│   ├── authService.js    ← register, login, google, refresh, logout
│   ├── tokenService.js   ← JWT + refresh token (hash + cookie)
│   └── atsService.js     ← análise ATS via Gemini
└── index.js              ← entry point
```

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Banco de dados

Abra o `migrations.sql` no MySQL Workbench e execute — ele cria o banco, tabelas e seed dos planos.

### 3. Variáveis de ambiente

```bash
cp .env.example .env
# Preencha todos os valores no .env
```

Variáveis obrigatórias:
| Variável | Descrição |
|---|---|
| `DB_PASSWORD` | Senha do MySQL |
| `JWT_ACCESS_SECRET` | Secret do access token (gere com crypto.randomBytes) |
| `JWT_REFRESH_SECRET` | Secret do refresh token (diferente do access) |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `GOOGLE_CLIENT_ID` | Client ID OAuth (só se usar login Google) |

### 4. Rodar

```bash
npm run dev    # desenvolvimento
npm start      # produção
```

---

## Endpoints

### Auth (público)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Cadastro |
| POST | `/api/auth/login` | `{ email, password }` | Login |
| POST | `/api/auth/google` | `{ idToken }` | Login Google |
| POST | `/api/auth/refresh` | — (cookie) | Renova access token |
| POST | `/api/auth/logout` | — | Revoga refresh token |
| GET | `/api/auth/me` | — | Dados do usuário logado |

### Análise (requer Bearer token)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| POST | `/api/analyze` | `{ resume_pdf_base64, job_description }` | Análise ATS |

### Health

```
GET /health → { status, env, ts }
```

---

## Segurança implementada

- **Helmet** — headers HTTP de segurança
- **CORS** por lista de origens
- **Rate limiting** na rota `/analyze` (configurável via `.env`)
- **JWT** access token curto (15min) + refresh token httpOnly cookie (30 dias)
- **Refresh token rotation** — cada uso gera um novo token e revoga o anterior
- **Bcrypt** com 12 rounds para senhas
- **Timing-safe** na comparação de senhas (evita user enumeration)
- **Soft delete** para conformidade com LGPD
- **Validação e sanitização** de todos os inputs antes de chegar nos services

---

## Deploy no Vercel

1. Suba o código no GitHub
2. Importe o projeto no Vercel apontando para a pasta `backend`
3. Adicione todas as variáveis de ambiente no painel do Vercel
4. O `vercel.json` já está configurado corretamente

> **Atenção:** o MySQL precisa ser acessível pela internet (use PlanetScale, Railway,
> Clever Cloud ou libere o IP do Vercel no seu servidor MySQL).
