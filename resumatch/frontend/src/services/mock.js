/**
 * MOCK MODE
 * Defina VITE_MOCK=true no frontend/.env para ativar.
 * Quando ativo, nenhuma chamada real é feita ao backend.
 */
export const MOCK_ENABLED = import.meta.env.VITE_MOCK === 'true'

export const MOCK_USER = {
  uuid:      'mock-uuid-0001',
  name:      'will Desenvolvedora',
  email:     'will@exemplo.com',
  company:   'Acme Corp',
  onboarded: true,
  created_at: '2025-01-15T10:00:00Z'
}

export const MOCK_TOKEN = 'mock-jwt-token-dev-only'

export const MOCK_PLANS = [
  {
    id: 1,
    name: 'Free',
    price: 0,
    description: 'Ideal para experimentar',
    is_active: true,
    features: ['5 análises/mês', 'Relatório básico', 'Suporte por e-mail']
  },
  {
    id: 2,
    name: 'Pro',
    price: 49.90,
    description: 'Para profissionais em busca ativa',
    is_active: true,
    popular: true,
    features: ['Análises ilimitadas', 'Relatório detalhado', 'Palavras-chave ATS', 'Suporte prioritário']
  },
  {
    id: 3,
    name: 'Business',
    price: 129.90,
    description: 'Para times de RH e recrutamento',
    is_active: true,
    features: ['Tudo do Pro', 'Multi-usuários (até 10)', 'API de integração', 'Gerente de conta dedicado']
  }
]

export const MOCK_SUBSCRIPTION = {
  id: 101,
  user_id: 'mock-uuid-0001',
  plan_id: 2,
  status: 'active',
  gateway_reference: 'sub_mockStripe123',
  created_at: '2025-03-01T00:00:00Z'
}

export const MOCK_TRANSACTIONS = [
  { id: 1, amount: 49.90, status: 'paid',   gateway_name: 'Stripe',    created_at: '2025-06-01' },
  { id: 2, amount: 49.90, status: 'paid',   gateway_name: 'Stripe',    created_at: '2025-05-01' },
  { id: 3, amount: 49.90, status: 'failed', gateway_name: 'Stripe',    created_at: '2025-04-01' },
  { id: 4, amount: 0,     status: 'paid',   gateway_name: 'Free tier', created_at: '2025-03-01' }
]