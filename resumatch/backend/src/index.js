import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { analyzeRouter } from './routes/analyze.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin "${origin}" not allowed`))
  }
}))

app.use(express.json({ limit: '20mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✓ ResuMatch backend running on http://localhost:${PORT}`)
  })
}

// Exportação crucial para as Serverless Functions do Vercel
export default app;