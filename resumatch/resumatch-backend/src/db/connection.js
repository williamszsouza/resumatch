/**
 * Conexão MySQL para ambiente serverless (Vercel).
 *
 * Em serverless cada request pode rodar em uma instância fria,
 * então NÃO usamos pool persistente — criamos e fechamos a conexão
 * por request para evitar vazamento de conexões.
 *
 * Para ambientes de servidor tradicional (Railway, VPS), o pool
 * é reaproveitado entre requests da mesma instância.
 */
import mysql from 'mysql2/promise'
import { config } from '../config/index.js'

const dbConfig = {
  host:               config.db.host,
  port:               config.db.port,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.database,
  charset:            'utf8mb4',
  timezone:           'Z',              // UTC
  waitForConnections: true,
  connectionLimit:    1,                // 1 conexão por instância serverless
  maxIdle:            1,
  idleTimeout:        10000,
  connectTimeout:     10000,
  enableKeepAlive:    false,
}

// Pool singleton — reutilizado em warm invocations
let pool = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
    console.log('[DB] Pool criado')
  }
  return pool
}

/**
 * Executa uma query retornando [rows, fields].
 * Usa o pool e devolve a conexão automaticamente.
 */
export async function query(sql, params = []) {
  const connection = await getPool().getConnection()
  try {
    const [rows, fields] = await connection.execute(sql, params)
    return [rows, fields]
  } finally {
    connection.release()
  }
}

/**
 * Executa múltiplas queries dentro de uma transação.
 * Passa a conexão para o callback — use-a para todos os queries do bloco.
 *
 * @example
 * await transaction(async (conn) => {
 *   await conn.execute('INSERT INTO users ...', [...])
 *   await conn.execute('INSERT INTO subscriptions ...', [...])
 * })
 */
export async function transaction(callback) {
  const connection = await getPool().getConnection()
  await connection.beginTransaction()
  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}
