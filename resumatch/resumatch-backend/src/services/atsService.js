import { GoogleGenAI } from '@google/genai'
import { config } from '../config/index.js'
import { AiServiceError } from '../config/errors.js'

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey })

const SYSTEM_INSTRUCTION = `
Você é um especialista sênior em recrutamento e sistemas ATS (Applicant Tracking System).
Sua tarefa é analisar currículos em relação a descrições de vagas com precisão técnica.
Responda EXCLUSIVAMENTE com JSON válido, sem markdown, sem texto adicional.
`.trim()

function buildPrompt(jobDescription) {
  return `
Analise o currículo em PDF fornecido em relação à seguinte descrição de vaga.

DESCRIÇÃO DA VAGA:
${jobDescription}

Retorne APENAS um JSON com esta estrutura exata:
{
  "score": <inteiro 0-100>,
  "verdict": <"alto" | "medio" | "baixo">,
  "title": <string até 60 chars resumindo o resultado>,
  "summary": <string com 2-3 frases sobre o match geral>,
  "scores": {
    "experiencia":    <0-100>,
    "habilidades":    <0-100>,
    "formacao":       <0-100>,
    "palavras_chave": <0-100>
  },
  "matching_keywords": [<até 12 palavras-chave que o candidato possui e a vaga pede>],
  "missing_keywords":  [<até 12 palavras-chave importantes da vaga ausentes no currículo>],
  "suggestions":       [<3 a 5 sugestões práticas e acionáveis para melhorar o currículo>]
}

Regras:
- verdict "alto" se score >= 70, "medio" se >= 45, "baixo" se < 45
- suggestions devem ser frases completas e objetivas
`.trim()
}

export async function runAtsAnalysis(resumeBase64, jobDescription) {
  let rawText

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: resumeBase64, mimeType: 'application/pdf' } },
            { text: buildPrompt(jobDescription) }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    })

    rawText = response.text

  } catch (err) {
    console.error('[atsService] Erro na chamada Gemini:', err.message)
    throw new AiServiceError(
      'Não foi possível processar a análise no momento. Tente novamente em instantes.'
    )
  }

  let parsed
  try {
    const clean = rawText.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    console.error('[atsService] Falha ao parsear resposta da IA:', rawText?.slice(0, 500))
    throw new AiServiceError('A IA retornou um formato inesperado. Tente novamente.')
  }

  return sanitizeResult(parsed)
}

function sanitizeResult(p) {
  const score = Math.min(100, Math.max(0, Number(p.score) || 0))
  const toArr = (v) => Array.isArray(v) ? v.map(String).slice(0, 12) : []

  return {
    score,
    verdict:          score >= 70 ? 'alto' : score >= 45 ? 'medio' : 'baixo',
    title:            String(p.title   || '').slice(0, 60),
    summary:          String(p.summary || ''),
    scores: {
      experiencia:    clamp(p.scores?.experiencia),
      habilidades:    clamp(p.scores?.habilidades),
      formacao:       clamp(p.scores?.formacao),
      palavras_chave: clamp(p.scores?.palavras_chave),
    },
    matching_keywords: toArr(p.matching_keywords),
    missing_keywords:  toArr(p.missing_keywords),
    suggestions:       Array.isArray(p.suggestions) ? p.suggestions.map(String).slice(0, 5) : [],
  }
}

function clamp(v) {
  return Math.min(100, Math.max(0, Number(v) || 0))
}
