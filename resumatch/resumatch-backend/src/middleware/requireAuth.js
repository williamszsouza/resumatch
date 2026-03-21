import { verifyAccessToken } from '../services/tokenService.js'
import { UnauthorizedError } from '../config/errors.js'

/**
 * Middleware que protege rotas autenticadas.
 * Extrai o Bearer token do header Authorization, verifica e injeta
 * os dados do usuário em req.user.
 *
 * Uso:
 *   router.get('/me', requireAuth, (req, res) => res.json(req.user))
 */
export function requireAuth(req, _res, next) {
  const authHeader = req.headers['authorization']

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de acesso ausente.')
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      uuid:  payload.sub,
      email: payload.email,
      name:  payload.name,
    }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expirado. Faça refresh.')
    }
    throw new UnauthorizedError('Token inválido.')
  }
}
