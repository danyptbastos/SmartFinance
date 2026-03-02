// src/services/geminiService.ts

import type { TransactionType } from "./types";

// Helper: POST JSON com tratamento de erro
async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data as any)?.error || res.statusText || "Erro na API";
    throw new Error(msg);
  }

  return data as T;
}

export type ParsedTransaction = {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  date?: string; // ISO YYYY-MM-DD (opcional)
};

// ✅ Agora chama a API segura
export const parseTransactionWithAI = async (
  userInput: string
): Promise<ParsedTransaction | null> => {
  try {
    return await postJSON<ParsedTransaction | null>("/api/parse-transaction", {
      userInput,
    });
  } catch (e) {
    console.error("parseTransactionWithAI error:", e);
    return null;
  }
};

// ✅ Já estava ok: chama a API segura
export const chatWithFinancialAI = async (
  history: any[],
  query: string,
  transactions: any[]
): Promise<string> => {
  const data = await postJSON<{ text: string }>("/api/chat", {
    history,
    query,
    transactions,
  });
  return data.text;
};

export type HealthDiagnosis = {
  diagnosis: string;
  actions: string[];
  outlook: string;
};

// ✅ Agora chama a API segura
export const getHealthDiagnosis = async (
  score: number,
  summary: any,
  budgets: any[],
  goals: any[]
): Promise<HealthDiagnosis | null> => {
  try {
    return await postJSON<HealthDiagnosis | null>("/api/health", {
      score,
      summary,
      budgets,
      goals,
    });
  } catch (e) {
    console.error("getHealthDiagnosis error:", e);
    return null;
  }
};

export type SemanticSearchResult = {
  answer: string;
  suggestedFilter: string;
};

// ✅ Agora chama a API segura
export const semanticHistorySearch = async (
  query: string,
  transactions: any[]
): Promise<SemanticSearchResult | null> => {
  try {
    return await postJSON<SemanticSearchResult | null>("/api/semantic-search", {
      query,
      transactions,
    });
  } catch (e) {
    console.error("semanticHistorySearch error:", e);
    return null;
  }
};

// --- Audio Encoding & Decoding ---

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encode = (bytes: Uint8Array) => {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
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