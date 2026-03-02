
import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "./types";

const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_GOOGLE_API_KEY ||
  "";

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
export const parseTransactionWithAI = async (userInput: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise a seguinte frase e extraia os dados para uma transação financeira em Euro (€): "${userInput}". Considere a data de hoje como ${new Date().toLocaleDateString()}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Breve descrição do gasto ou ganho" },
          amount: { type: Type.NUMBER, description: "O valor numérico em Euro" },
          type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"], description: "Tipo da transação" },
          categoryName: { type: Type.STRING, description: "Uma categoria sugerida (ex: Alimentação, Transporte, Lazer, Saúde, Salário, Moradia, Educação)" },
          date: { type: Type.STRING, description: "Data no formato ISO YYYY-MM-DD" }
        },
        required: ["description", "amount", "type", "categoryName"]
      },
      systemInstruction: "Você é um assistente financeiro pessoal operando em Euro (€). Extraia dados de transações de frases em português. Se o usuário não disser a data, use a data de hoje fornecida no prompt."
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};

export const chatWithFinancialAI = async (history: any[], query: string, transactions: any[]) => {
  const context = JSON.stringify(transactions.slice(0, 50));
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Dados Financeiros (em Euro €): ${context}\nUsuário: ${query}`,
    config: {
      systemInstruction: "Você é um consultor financeiro pessoal europeu que tem acesso ao extrato do usuário acima. Todas as moedas são em Euro (€). Responda perguntas sobre gastos, dê dicas de economia e faça projeções baseadas nos dados reais fornecidos. Seja amigável e direto."
    }
  });
  return response.text;
};

export const getHealthDiagnosis = async (score: number, summary: any, budgets: any[], goals: any[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analise minha saúde financeira. Score: ${score}/100. Resumo: ${JSON.stringify(summary)}. Orçamentos: ${JSON.stringify(budgets)}. Metas: ${JSON.stringify(goals)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING, description: "Análise técnica do porquê do score" },
          actions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 ações exatas para melhorar a saúde financeira hoje"
          },
          outlook: { type: Type.STRING, description: "Perspectiva para os próximos 30 dias" }
        },
        required: ["diagnosis", "actions", "outlook"]
      },
      systemInstruction: "Você é o motor neural do SmartFinance. Gere um relatório técnico, porém motivador, sobre a saúde financeira do usuário baseado nos dados fornecidos."
    }
  });
  return JSON.parse(response.text);
};

export const semanticHistorySearch = async (query: string, transactions: any[]) => {
  const context = JSON.stringify(transactions.slice(0, 40));
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Pergunta do usuário sobre o histórico: "${query}". Contexto de transações: ${context}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING, description: "Resposta direta e curta para a pergunta" },
          suggestedFilter: { type: Type.STRING, description: "Um termo de busca simples que filtraria as transações relevantes no histórico" }
        },
        required: ["answer", "suggestedFilter"]
      },
      systemInstruction: "Você é um motor de busca semântica para extratos bancários. Analise a pergunta e responda com base nos dados. Se o usuário perguntar quanto gastou com algo, faça a conta."
    }
  });
  return JSON.parse(response.text);
};

// --- Audio Encoding & Decoding following guideline ---

// Manually implement base64 decoding to handle binary audio data
export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Manually implement base64 encoding for binary audio data
export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Raw PCM audio decoding logic following Google GenAI SDK guidelines
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
