import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { score, summary, budgets, goals } = req.body || {};

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analise minha saúde financeira. Score: ${score}/100. Resumo: ${JSON.stringify(
        summary
      )}. Orçamentos: ${JSON.stringify(budgets)}. Metas: ${JSON.stringify(goals)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: {
              type: Type.STRING,
              description: "Análise técnica do porquê do score",
            },
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 ações exatas para melhorar a saúde financeira hoje",
            },
            outlook: {
              type: Type.STRING,
              description: "Perspectiva para os próximos 30 dias",
            },
          },
          required: ["diagnosis", "actions", "outlook"],
        },
        systemInstruction:
          "Você é o motor neural do SmartFinance. Gere um relatório técnico, porém motivador, sobre a saúde financeira do usuário baseado nos dados fornecidos. Todas as moedas são em Euro (€).",
      },
    });

    // @google/genai retorna texto em response.text
    const text = response.text;
    const json = JSON.parse(text);

    return res.status(200).json(json);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Error" });
  }
}