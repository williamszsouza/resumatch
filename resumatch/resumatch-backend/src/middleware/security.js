import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config } from '../config/index.js'
import { RateLimitError } from '../config/errors.js'

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (config.cors.allowedOrigins.includes(origin)) return cb(null, true)
    console.warn(`[CORS] Origem bloqueada: ${origin}`)
    return cb(null, false)
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
})

export const analysisRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) =>
    req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown',
  handler: (_req, _res, next) => next(new RateLimitError())
})

export function requestLogger(req, _res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown'
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} — ${ip}`)
  next()
}
