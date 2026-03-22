import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import { config }          from './config/index.js'
import { helmetMiddleware, corsMiddleware, requestLogger } from './middleware/security.js'
import { errorHandler }    from './middleware/errorHandler.js'
import { authRouter }      from './routes/auth.js'
import { analyzeRouter }   from './routes/analyze.js'
import { plansRouter }     from './routes/plans.js'
import { usersRouter }     from './routes/users.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmetMiddleware)
app.use(corsMiddleware)

app.options('*', corsMiddleware)

app.use(requestLogger)
app.use(express.json({ limit: config.maxPayloadSize }))
app.use(cookieParser())

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRouter)
app.use('/api/users', usersRouter)
app.use('/api',       analyzeRouter)
app.use('/api',       plansRouter)

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: config.nodeEnv, ts: new Date().toISOString() })
)

app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } })
)

app.use(errorHandler)

if (config.nodeEnv !== 'production') {
  app.listen(config.port, () => {
    console.log(`✓ ResuMatch backend — http://localhost:${config.port}`)
    console.log(`  Origens permitidas: ${config.cors.allowedOrigins.join(', ')}`)
  })
}

export default app