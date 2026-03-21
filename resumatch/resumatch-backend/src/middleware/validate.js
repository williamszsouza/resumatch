import { ValidationError } from '../config/errors.js'
import { config } from '../config/index.js'

export function validateAnalyzeBody(req, _res, next) {
  const { resume_pdf_base64, job_description } = req.body

  if (!resume_pdf_base64 || typeof resume_pdf_base64 !== 'string') {
    throw new ValidationError('resume_pdf_base64 é obrigatório.', 'resume_pdf_base64')
  }

  const cleanBase64 = resume_pdf_base64.replace(/^data:application\/pdf;base64,/, '')

  if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
    throw new ValidationError('resume_pdf_base64 não é um base64 válido.', 'resume_pdf_base64')
  }

  if (cleanBase64.length > config.maxPdfBase64Length) {
    throw new ValidationError(
      `O PDF excede o tamanho máximo permitido.`,
      'resume_pdf_base64'
    )
  }

  if (!job_description || typeof job_description !== 'string') {
    throw new ValidationError('job_description é obrigatório.', 'job_description')
  }

  const trimmed = job_description.trim()

  if (trimmed.length < 50) {
    throw new ValidationError('A descrição da vaga deve ter ao menos 50 caracteres.', 'job_description')
  }

  if (trimmed.length > 20_000) {
    throw new ValidationError('A descrição da vaga não pode exceder 20.000 caracteres.', 'job_description')
  }

  req.cleanBody = { resumeBase64: cleanBase64, jobDescription: trimmed }
  next()
}
