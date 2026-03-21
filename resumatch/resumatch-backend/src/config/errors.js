export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.name           = 'AppError'
    this.statusCode     = statusCode
    this.code           = code
    this.isOperational  = true
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name  = 'ValidationError'
    this.field = field
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class AiServiceError extends AppError {
  constructor(message) {
    super(message, 502, 'AI_SERVICE_ERROR')
    this.name = 'AiServiceError'
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Muitas requisições. Tente novamente em instantes.', 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}
