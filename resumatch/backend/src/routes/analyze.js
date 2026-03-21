import { Router } from 'express'
import { runAtsAnalysis } from '../services/atsService.js'

export const analyzeRouter = Router()


analyzeRouter.post('/analyze', async (req, res, next) => {
  try {
    const { resume_pdf_base64, job_description } = req.body

    if (!resume_pdf_base64) {
      return res.status(400).json({ error: 'resume_pdf_base64 é obrigatório.' })
    }
    if (!job_description?.trim()) {
      return res.status(400).json({ error: 'job_description é obrigatório.' })
    }

    const result = await runAtsAnalysis(resume_pdf_base64, job_description)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
