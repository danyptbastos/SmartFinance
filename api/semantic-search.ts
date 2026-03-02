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
    const { query, transactions } = req.body || {};

    const ai = new GoogleGenAI({ apiKey });

    const context = JSON.stringify((transactions || []).slice(0, 40));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pergunta do usuário sobre o histórico: "${query}". Contexto de transações: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "Resposta direta e curta para a pergunta",
            },
            suggestedFilter: {
              type: Type.STRING,
              description:
                "Um termo de busca simples que filtraria as transações relevantes no histórico",
            },
          },
          required: ["answer", "suggestedFilter"],
        },
        systemInstruction:
          "Você é um motor de busca semântica para extratos financeiros. Responda com base nos dados fornecidos. Se o usuário perguntar quanto gastou com algo, faça a conta. Moeda: Euro (€).",
      },
    });

    const text = response.text;
    const json = JSON.parse(text);

    return res.status(200).json(json);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Error" });
  }
}