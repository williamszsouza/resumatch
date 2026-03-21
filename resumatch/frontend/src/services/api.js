import axios from 'axios'

/**
 * Base axios instance.
 * In dev, Vite proxies /api → http://localhost:3001
 * In production, set VITE_API_BASE_URL in your .env
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'api',
  timeout: 120_000, // 2 min – AI calls can be slow
  headers: { 'Content-Type': 'application/json' }
})

// ─── Request interceptor (add auth tokens here if needed) ───────────────────
api.interceptors.request.use(
  (config) => {
    // Example: const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor (normalize errors) ────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro desconhecido'
    return Promise.reject(new Error(message))
  }
)

// ─── ATS Analysis ────────────────────────────────────────────────────────────

/**
 * Sends the resume PDF (as base64) + job description to the backend.
 *
 * @param {string} resumeBase64  - PDF file encoded as base64 string
 * @param {string} jobDescription - Plain text of the job posting
 * @returns {Promise<AnalysisResult>}
 *
 * Expected response shape:
 * {
 *   score: number,                     // 0–100
 *   verdict: 'alto' | 'medio' | 'baixo',
 *   title: string,
 *   summary: string,
 *   scores: {
 *     experiencia: number,
 *     habilidades: number,
 *     formacao: number,
 *     palavras_chave: number
 *   },
 *   matching_keywords: string[],
 *   missing_keywords: string[],
 *   suggestions: string[]
 * }
 */
export async function analyzeResume(resumeBase64, jobDescription) {
  return api.post('api/analyze', {
    resume_pdf_base64: resumeBase64,
    job_description: jobDescription
  })
}

export default api
