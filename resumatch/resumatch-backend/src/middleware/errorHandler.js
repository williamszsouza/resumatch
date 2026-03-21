import { config } from '../config/index.js'
import { AppError } from '../config/errors.js'

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code:    err.code,
        message: err.message,
        ...(err.field ? { field: err.field } : {})
      }
    })
  }

  console.error('[UNHANDLED ERROR]', {
    message: err.message,
    stack:   err.stack,
    url:     req.url,
    method:  req.method,
  })

  res.status(500).json({
    error: {
      code:    'INTERNAL_ERROR',
      message: config.isProd
        ? 'Ocorreu um erro interno. Tente novamente.'
        : err.message
    }
  })
}
