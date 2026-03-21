import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAtsAnalysis(resumeBase64, jobDescription) {
  // Limpa o prefixo do Base64 caso o frontend envie
  const cleanBase64 = resumeBase64.replace(/^data:application\/pdf;base64,/, "");

  const prompt = `
    Analise este currículo em relação à vaga abaixo.
    VAGA: ${jobDescription}

    Retorne APENAS um JSON válido com a seguinte estrutura:
    {
      "score": 0,
      "verdict": "alto",
      "title": "resumo",
      "summary": "resumo",
      "scores": { "experiencia": 0, "habilidades": 0, "formacao": 0, "palavras_chave": 0 },
      "matching_keywords": ["a", "b"],
      "missing_keywords": ["c", "d"],
      "suggestions": ["sugestão 1"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      systemInstruction: "Você é um especialista em recrutamento e sistemas ATS.",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: cleanBase64, mimeType: "application/pdf" } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text;
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    let parsed = JSON.parse(cleanJson);

    parsed.score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
    if (parsed.score >= 70) parsed.verdict = 'alto';
    else if (parsed.score >= 45) parsed.verdict = 'medio';
    else parsed.verdict = 'baixo';

    return parsed;

  } catch (error) {
    console.error('[atsService] Erro com o GenAI SDK:', error);
    throw error;
  }
}