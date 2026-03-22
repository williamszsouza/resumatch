import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import {
  getAllActivePlans,
  getSubscriptionByUser,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getTransactionsByUser
} from '../db/plansRepository.js'
import { ValidationError } from '../config/errors.js'

export const plansRouter = Router()

// GET /api/plans — público, qualquer um pode ver os planos
plansRouter.get('/plans', async (_req, res, next) => {
  try {
    const plans = await getAllActivePlans()
    res.json(plans)
  } catch (err) { next(err) }
})

// GET /api/subscriptions/me
plansRouter.get('/subscriptions/me', requireAuth, async (req, res, next) => {
  try {
    const sub = await getSubscriptionByUser(req.user.uuid)
    res.json(sub)
  } catch (err) { next(err) }
})

// POST /api/subscriptions
plansRouter.post('/subscriptions', requireAuth, async (req, res, next) => {
  try {
    const { plan_id } = req.body
    if (!plan_id) throw new ValidationError('plan_id é obrigatório.', 'plan_id')
    const sub = await createSubscription(req.user.uuid, plan_id)
    res.status(201).json(sub)
  } catch (err) { next(err) }
})

// PATCH /api/subscriptions/me
plansRouter.patch('/subscriptions/me', requireAuth, async (req, res, next) => {
  try {
    const { plan_id } = req.body
    if (!plan_id) throw new ValidationError('plan_id é obrigatório.', 'plan_id')
    const sub = await updateSubscription(req.user.uuid, plan_id)
    res.json(sub)
  } catch (err) { next(err) }
})

// DELETE /api/subscriptions/me
plansRouter.delete('/subscriptions/me', requireAuth, async (req, res, next) => {
  try {
    await cancelSubscription(req.user.uuid)
    res.json({ message: 'Assinatura cancelada.' })
  } catch (err) { next(err) }
})

// GET /api/transactions
plansRouter.get('/transactions', requireAuth, async (req, res, next) => {
  try {
    const txs = await getTransactionsByUser(req.user.uuid)
    res.json(txs)
  } catch (err) { next(err) }
})