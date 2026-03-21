import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { analyzeRouter } from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    // Permitir se não houver origin (ex: Postman) ou se estiver na lista
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true)
    }
    // Em vez de dar throw Error, apenas negamos. Isso evita o 500 no Preflight.
    return cb(null, false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Garante que o Vercel responda 200 OK para o Preflight (OPTIONS)
app.options('*', cors())

app.use(express.json({ limit: '20mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message)
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  })
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✓ ResuMatch backend running on http://localhost:${PORT}`)
  })
}

export default app;