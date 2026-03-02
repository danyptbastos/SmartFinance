export const config = { runtime: "nodejs" };

import { GoogleGenAI } from "@google/genai";

async function readJson(req: any) {
  return await new Promise<any>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  try {
    // DEBUG GET
    if (req.method === "GET") {
      return res.status(200).json({
        vercelEnv: process.env.VERCEL_ENV || null,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
        node: process.version,
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const body = await readJson(req);
    const { query, transactions } = body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing 'query' in request body" });
    }

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
    // 👇 isto é o MAIS IMPORTANTE: ver no log da Vercel
    console.error("API /api/chat ERROR:", e);

    // tenta devolver algo útil
    return res.status(500).json({
      error: e?.message || "Error",
      name: e?.name || null,
    });
  }
}