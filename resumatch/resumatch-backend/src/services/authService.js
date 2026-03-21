import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { config }       from '../config/index.js'
import { ValidationError, UnauthorizedError, ConflictError } from '../config/errors.js'
import {
  findUserByEmail,
  findUserByGoogleId,
  findUserByUuid,
  createUser,
} from '../db/userRepository.js'
import {
  signAccessToken,
  issueRefreshToken,
  validateRefreshToken,
  rotateRefreshToken,
  revokeToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearCookieOptions,
} from './tokenService.js'

const googleClient = new OAuth2Client(config.google.clientId)

const BCRYPT_ROUNDS = 12

// ── Helpers ───────────────────────────────────────────────────────────────────

function publicUser(user) {
  // Nunca retorna password_hash ou google_id ao cliente
  const { password_hash, google_id, ...safe } = user
  return safe
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions())
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(res, { name, email, password }) {
  // Validações
  if (!name?.trim())                       throw new ValidationError('Nome é obrigatório.', 'name')
  if (!/\S+@\S+\.\S+/.test(email))        throw new ValidationError('E-mail inválido.', 'email')
  if (!password || password.length < 8)   throw new ValidationError('Senha deve ter ao menos 8 caracteres.', 'password')

  const existing = await findUserByEmail(email)
  if (existing) throw new ConflictError('Este e-mail já está cadastrado.')

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const user = await createUser({ name: name.trim(), email: email.toLowerCase(), passwordHash })

  const accessToken  = signAccessToken(user)
  const refreshToken = await issueRefreshToken(user.uuid)
  setRefreshCookie(res, refreshToken)

  return { token: accessToken, user: publicUser(user) }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(res, { email, password }) {
  if (!email || !password) throw new ValidationError('E-mail e senha são obrigatórios.')

  const user = await findUserByEmail(email.toLowerCase())

  // Mesmo tempo de resposta se usuário não existe (evita user enumeration)
  const dummyHash = '$2a$12$invalidhashfortimingnorealuser0000000000000000000000'
  const hash      = user?.password_hash || dummyHash
  const valid     = await bcrypt.compare(password, hash)

  if (!user || !valid) throw new UnauthorizedError('E-mail ou senha incorretos.')

  const accessToken  = signAccessToken(user)
  const refreshToken = await issueRefreshToken(user.uuid)
  setRefreshCookie(res, refreshToken)

  return { token: accessToken, user: publicUser(user) }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function loginWithGoogle(res, { idToken }) {
  if (!idToken) throw new ValidationError('idToken do Google é obrigatório.', 'idToken')
  if (!config.google.clientId) throw new Error('GOOGLE_CLIENT_ID não configurado.')

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    })
    payload = ticket.getPayload()
  } catch {
    throw new UnauthorizedError('Token Google inválido ou expirado.')
  }

  const { sub: googleId, email, name, picture: avatarUrl } = payload

  // Tenta achar por google_id, depois por email (conta pode ter sido criada antes)
  let user = await findUserByGoogleId(googleId)
    || await findUserByEmail(email.toLowerCase())

  if (!user) {
    user = await createUser({
      name,
      email:     email.toLowerCase(),
      googleId,
      avatarUrl: avatarUrl || null,
    })
  }

  const accessToken  = signAccessToken(user)
  const refreshToken = await issueRefreshToken(user.uuid)
  setRefreshCookie(res, refreshToken)

  return { token: accessToken, user: publicUser(user) }
}

// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refresh(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!rawToken) throw new UnauthorizedError('Refresh token ausente.')

  const tokenRow = await validateRefreshToken(rawToken)
  if (!tokenRow)  throw new UnauthorizedError('Refresh token inválido ou expirado.')

  const user = await findUserByUuid(tokenRow.user_uuid)
  if (!user)      throw new UnauthorizedError('Usuário não encontrado.')

  // Rotaciona: revoga o atual e emite um novo (refresh token rotation)
  const newRefreshToken = await rotateRefreshToken(rawToken, user.uuid)
  const newAccessToken  = signAccessToken(user)
  setRefreshCookie(res, newRefreshToken)

  return { token: newAccessToken, user: publicUser(user) }
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (rawToken) await revokeToken(rawToken)

  res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions())
  return { message: 'Logout realizado com sucesso.' }
}
