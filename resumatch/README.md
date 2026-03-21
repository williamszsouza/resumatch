# ResuMatch · ATS Intelligence

Aplicação de análise de compatibilidade entre currículo e vaga de emprego usando IA.

```
resumatch/
├── frontend/          ← Vue 3 + Vite
│   └── src/
│       ├── components/
│       │   ├── AppHeader.vue
│       │   ├── UploadZone.vue
│       │   ├── LoadingSteps.vue
│       │   ├── ScoreRing.vue
│       │   └── AnalysisResults.vue
│       ├── services/
│       │   └── api.js      ← todas as chamadas HTTP ficam aqui
│       ├── assets/
│       │   └── global.css
│       ├── App.vue
│       └── main.js
│
└── backend/           ← Node.js + Express
    └── src/
        ├── routes/
        │   └── analyze.js      ← POST /api/analyze
        ├── services/
        │   └── atsService.js   ← lógica de IA (Anthropic SDK)
        └── index.js
```

---

## Pré-requisitos

- Node.js 18+
- Chave de API da Anthropic (ou outro provider)

---

## Configuração

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env e insira sua ANTHROPIC_API_KEY
npm install
npm run dev
# Servidor sobe em http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # opcional em desenvolvimento
npm install
npm run dev
# App sobe em http://localhost:5173
```

### 3. Rodar os dois juntos (da raiz)

```bash
npm install          # instala concurrently
npm run dev          # sobe frontend + backend simultaneamente
```

---

## API

### `POST /api/analyze`

**Request body:**
```json
{
  "resume_pdf_base64": "<base64 do PDF>",
  "job_description": "Texto completo da descrição da vaga..."
}
```

**Response:**
```json
{
  "score": 78,
  "verdict": "alto",
  "title": "Perfil bem alinhado à vaga",
  "summary": "O candidato demonstra sólida experiência...",
  "scores": {
    "experiencia": 80,
    "habilidades": 75,
    "formacao": 90,
    "palavras_chave": 70
  },
  "matching_keywords": ["Python", "React", "Scrum", "REST API"],
  "missing_keywords": ["Docker", "Kubernetes", "CI/CD"],
  "suggestions": [
    "Adicione experiências com infraestrutura cloud ao currículo.",
    "Mencione certificações relevantes na área de DevOps.",
    "Inclua métricas de impacto nos projetos descritos."
  ]
}
```

---

## Trocar o provider de IA

Toda a lógica de IA está em `backend/src/services/atsService.js`.  
Para usar OpenAI, Gemini ou outro provider, basta substituir o cliente e o formato da chamada nesse arquivo — o resto da aplicação não precisa mudar.

---

## Health check

```
GET http://localhost:3001/health
→ { "status": "ok" }
```
