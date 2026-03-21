import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config/index.js'
import {
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken
} from '../db/userRepository.js'

// ── Access Token ──────────────────────────────────────────────────────────────

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub:   user.uuid,
      email: user.email,
      name:  user.name,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpires }
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret)
}

// ── Refresh Token ─────────────────────────────────────────────────────────────

/**
 * Gera um refresh token opaco (256 bits), salva o hash no banco
 * e retorna o token raw para enviar no cookie.
 */
export async function issueRefreshToken(userUuid) {
  const raw       = crypto.randomBytes(32).toString('hex')   // 64 chars hex
  const tokenHash = hashToken(raw)
  const expiresAt = new Date(
    Date.now() + config.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000
  )

  await saveRefreshToken(userUuid, tokenHash, expiresAt)
  return raw
}

/**
 * Valida o refresh token raw vindo do cookie.
 * Retorna a row do banco se válido, null caso contrário.
 */
export async function validateRefreshToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null
  const tokenHash = hashToken(rawToken)
  return findRefreshToken(tokenHash)
}

export async function rotateRefreshToken(oldRaw, userUuid) {
  // Revoga o antigo
  await revokeRefreshToken(hashToken(oldRaw))
  // Emite um novo
  return issueRefreshToken(userUuid)
}

export async function revokeToken(rawToken) {
  await revokeRefreshToken(hashToken(rawToken))
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export const REFRESH_COOKIE_NAME = 'rm_refresh'

export function refreshCookieOptions() {
  return {
    httpOnly: true,                           // inacessível ao JS do browser
    secure:   config.isProd,                  // HTTPS apenas em produção
    sameSite: config.isProd ? 'strict' : 'lax',
    maxAge:   config.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000,
    path:     '/api/auth',                    // limita o cookie à rota de auth
  }
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure:   config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    path:     '/api/auth',
  }
}

// ── Interno ───────────────────────────────────────────────────────────────────

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}
