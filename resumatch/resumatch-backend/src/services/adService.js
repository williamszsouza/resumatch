/**
 * Serviço de controle de anúncios.
 * Gerencia o contador de análises e define qual duração de anúncio exibir.
 *
 * Regras:
 * - Só exibe anúncio para usuários do plano Free
 * - A cada 5 análises, 1 anúncio longo (60s) — os demais são 15s
 * - VITE_SKIP_ADS=true pula tudo (dev/homologação)
 */

const STORAGE_KEY  = 'rm_ad_count'
const LONG_AD_EVERY = 5

export const ADS_ENABLED = import.meta.env.VITE_SKIP_ADS !== 'true'

/**
 * Retorna quantas análises o usuário já fez (desde o último reset)
 */
export function getAnalysisCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
}

/**
 * Incrementa o contador e retorna o novo valor
 */
export function incrementAnalysisCount() {
  const next = getAnalysisCount() + 1
  localStorage.setItem(STORAGE_KEY, String(next))
  return next
}

/**
 * Retorna a duração em segundos do próximo anúncio
 * A cada LONG_AD_EVERY análises → 60s, senão → 15s
 */
export function getNextAdDuration() {
  const count = getAnalysisCount()
  // Se a PRÓXIMA análise é múltiplo de 5 → anúncio longo
  const next = count + 1
  return next % LONG_AD_EVERY === 0 ? 60 : 15
}

/**
 * Verifica se o usuário está no plano Free
 */
export function isFreePlan(subscription) {
  if (!subscription) return true
  return subscription.plan_id === 1 || subscription.status !== 'active'
}