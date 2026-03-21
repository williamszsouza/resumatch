import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { analyzeRouter } from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

console.log('[System] Allowed Origins:', process.env.ALLOWED_ORIGINS)

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true)
    }
    console.warn(`[CORS Blocked] Origin: ${origin}`)
    return cb(null, false)
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}))

app.options('*', cors())

app.use(express.json({ limit: '20mb' }))

// ── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('!!! CRITICAL ERROR !!!')
  console.error('Message:', err.message)
  console.error('Stack:', err.stack)
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✓ ResuMatch backend running on http://localhost:${PORT}`)
  })
}

export default app;