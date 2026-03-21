const required = ['GEMINI_API_KEY', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD']

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[Config] ERRO: variável obrigatória ausente: ${key}`)
    process.exit(1)
  }
}

export const config = {
  port:    parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd:  process.env.NODE_ENV === 'production',

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME     || 'resumatch',
  },

  jwt: {
    accessSecret:      process.env.JWT_ACCESS_SECRET,
    refreshSecret:     process.env.JWT_REFRESH_SECRET,
    accessExpires:     process.env.JWT_ACCESS_EXPIRES     || '15m',
    refreshExpiresDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30', 10),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',').map(o => o.trim()).filter(Boolean),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX        || '10',    10),
  },

  maxPayloadSize:     '20mb',
  maxPdfBase64Length: 14_000_000,
}
