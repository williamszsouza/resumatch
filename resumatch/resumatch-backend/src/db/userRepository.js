import { query, transaction } from './connection.js'

// ── Leitura ───────────────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  const [rows] = await query(
    'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [email]
  )
  return rows[0] || null
}

export async function findUserByUuid(uuid) {
  const [rows] = await query(
    'SELECT * FROM users WHERE uuid = ? AND deleted_at IS NULL LIMIT 1',
    [uuid]
  )
  return rows[0] || null
}

export async function findUserByGoogleId(googleId) {
  const [rows] = await query(
    'SELECT * FROM users WHERE google_id = ? AND deleted_at IS NULL LIMIT 1',
    [googleId]
  )
  return rows[0] || null
}

// ── Escrita ───────────────────────────────────────────────────────────────────

export async function createUser({ name, email, passwordHash = null, googleId = null, avatarUrl = null }) {
  const [result] = await query(
    `INSERT INTO users (name, email, password_hash, google_id, avatar_url)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, googleId, avatarUrl]
  )
  // uuid é gerado pelo banco via DEFAULT (UUID())
  const [rows] = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  return rows[0]
}

export async function updateUser(uuid, fields) {
  const allowed = ['name', 'email', 'avatar_url', 'onboarded','company_name','role','goal']
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
  if (!entries.length) return findUserByUuid(uuid)

  console.log('[updateUser] uuid:', uuid)
  console.log('[updateUser] fields recebidos:', fields)
  console.log('[updateUser] entries filtradas:', entries)

  const setClauses = entries.map(([k]) => `${k} = ?`).join(', ')
  const values     = entries.map(([, v]) => v)

  await query(
    `UPDATE users SET ${setClauses} WHERE uuid = ? AND deleted_at IS NULL`,
    [...values, uuid]
  )
  return findUserByUuid(uuid)
}

export async function softDeleteUser(uuid) {
  await query(
    'UPDATE users SET deleted_at = NOW() WHERE uuid = ? AND deleted_at IS NULL',
    [uuid]
  )
}

// ── Refresh tokens ────────────────────────────────────────────────────────────

export async function saveRefreshToken(userUuid, tokenHash, expiresAt) {
  await query(
    'INSERT INTO refresh_tokens (user_uuid, token_hash, expires_at) VALUES (?, ?, ?)',
    [userUuid, tokenHash, expiresAt]
  )
}

export async function findRefreshToken(tokenHash) {
  const [rows] = await query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ?
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  )
  return rows[0] || null
}

export async function revokeRefreshToken(tokenHash) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?',
    [tokenHash]
  )
}

export async function revokeAllUserRefreshTokens(userUuid) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_uuid = ? AND revoked_at IS NULL',
    [userUuid]
  )
}

// Limpa tokens expirados (pode chamar periodicamente ou num cron)
export async function purgeExpiredTokens() {
  const [result] = await query(
    'DELETE FROM refresh_tokens WHERE expires_at < NOW()',
  )
  return result.affectedRows
}
