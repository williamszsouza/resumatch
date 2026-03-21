import { Router } from 'express'
import { requireAuth }   from '../middleware/requireAuth.js'
import { validateAnalyzeBody } from '../middleware/validate.js'
import { analysisRateLimiter } from '../middleware/security.js'
import { runAtsAnalysis } from '../services/atsService.js'

export const analyzeRouter = Router()

// Rota protegida: precisa de JWT válido + rate limit + validação de body
analyzeRouter.post(
  '/analyze',
  requireAuth,
  analysisRateLimiter,
  validateAnalyzeBody,
  async (req, res, next) => {
    try {
      const { resumeBase64, jobDescription } = req.cleanBody
      const result = await runAtsAnalysis(resumeBase64, jobDescription)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
)
