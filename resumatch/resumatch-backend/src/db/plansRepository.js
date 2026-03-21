import { query } from './connection.js'

function parseFeatures(features) {
  if (!features) return []
  if (Array.isArray(features)) return features        // MySQL 8 já deserializou
  if (typeof features === 'object') return features
  try { return JSON.parse(features) } catch { return [] }
}

export async function getAllActivePlans() {
  const [rows] = await query(
    'SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC'
  )
  return rows.map(p => ({ ...p, features: parseFeatures(p.features) }))
}

export async function getSubscriptionByUser(userUuid) {
  const [rows] = await query(
    `SELECT s.*, p.name as plan_name, p.price, p.features
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.user_uuid = ?
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userUuid]
  )
  if (!rows[0]) return null
  return { ...rows[0], features: parseFeatures(rows[0].features) }
}

export async function createSubscription(userUuid, planId) {
  await query(
    `UPDATE subscriptions SET status = 'canceled'
     WHERE user_uuid = ? AND status = 'active'`,
    [userUuid]
  )
  await query(
    `INSERT INTO subscriptions (user_uuid, plan_id, status)
     VALUES (?, ?, 'active')`,
    [userUuid, planId]
  )
  return getSubscriptionByUser(userUuid)
}

export async function updateSubscription(userUuid, planId) {
  await query(
    `UPDATE subscriptions SET plan_id = ?, updated_at = NOW()
     WHERE user_uuid = ? AND status = 'active'`,
    [planId, userUuid]
  )
  return getSubscriptionByUser(userUuid)
}

export async function cancelSubscription(userUuid) {
  await query(
    `UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
     WHERE user_uuid = ? AND status = 'active'`,
    [userUuid]
  )
}

export async function getTransactionsByUser(userUuid) {
  const [rows] = await query(
    `SELECT * FROM transactions
     WHERE user_uuid = ?
     ORDER BY created_at DESC`,
    [userUuid]
  )
  return rows
}