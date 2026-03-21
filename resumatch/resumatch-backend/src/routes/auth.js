import { Router } from 'express'
import { requireAuth }   from '../middleware/requireAuth.js'
import {
  register,
  login,
  loginWithGoogle,
  refresh,
  logout,
} from '../services/authService.js'
import { findUserByUuid } from '../db/userRepository.js'

export const authRouter = Router()

// ── POST /api/auth/register ───────────────────────────────────────────────────
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = await register(res, req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = await login(res, req.body)
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/auth/google ─────────────────────────────────────────────────────
authRouter.post('/google', async (req, res, next) => {
  try {
    const data = await loginWithGoogle(res, req.body)
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Usa o httpOnly cookie para rotacionar tokens silenciosamente
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const data = await refresh(req, res)
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
authRouter.post('/logout', async (req, res, next) => {
  try {
    const data = await logout(req, res)
    res.json(data)
  } catch (err) { next(err) }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await findUserByUuid(req.user.uuid)
    if (!user) return res.status(404).json({ error: { message: 'Usuário não encontrado.' } })
    const { password_hash, google_id, ...safe } = user
    res.json(safe)
  } catch (err) { next(err) }
})
