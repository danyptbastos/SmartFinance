import { GoogleGenAI } from "@google/genai";

// força runtime node (evita confusões)
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  // DEBUG: testar no browser com GET
  if (req.method === "GET") {
    return res.status(200).json({
      vercelEnv: process.env.VERCEL_ENV || null,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY",
      vercelEnv: process.env.VERCEL_ENV || null,
    });
  }

  try {
    const { query, transactions } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });

    const context = JSON.stringify((transactions || []).slice(0, 50));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Dados Financeiros (€): ${context}\nUsuário: ${query}`,
      config: {
        systemInstruction:
          "Você é um consultor financeiro pessoal europeu. Todas as moedas são em Euro (€). Seja direto e prático.",
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Error" });
  }
}