export const config = { runtime: "nodejs" };

import { GoogleGenAI } from "@google/genai";

/* ----------------------- Helpers ----------------------- */

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

function toISO(dateLike: any) {
  if (!dateLike) return null;

  if (typeof dateLike === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateLike))
    return dateLike;

  if (typeof dateLike === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateLike)) {
    const [dd, mm, yyyy] = dateLike.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function monthKey(iso: string) {
  return iso?.slice(0, 7);
}

function sum(n: number[]) {
  return n.reduce((a, b) => a + b, 0);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isOverloadError(e: any) {
  const msg = (e?.message || "").toLowerCase();
  const code = e?.code || e?.status;
  return (
    code === 503 ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded")
  );
}

async function generateWithRetry(ai: any, payload: any) {
  const models = [
    "gemini-3-flash-preview",
    "gemini-3-flash",
    "gemini-1.5-flash",
  ];

  let lastErr: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await ai.models.generateContent({
          ...payload,
          model,
        });
      } catch (e: any) {
        lastErr = e;

        if (isOverloadError(e)) {
          await sleep(400 * (attempt + 1) ** 2);
          continue;
        }

        break;
      }
    }
  }

  throw lastErr;
}

/* ----------------------- Text Clean ----------------------- */

function cleanAIText(t: string) {
  return (t || "")
    .replace(/\*\*/g, "")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/`{1,3}/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ----------------------- Handler ----------------------- */

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        vercelEnv: process.env.VERCEL_ENV || null,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const body = await readJson(req);
    const { query, transactions } = body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing 'query'" });
    }

    const tx = Array.isArray(transactions) ? transactions : [];

    const normalized = tx
      .slice(0, 500)
      .map((t: any) => {
        const amount = Number(t.amount ?? t.value ?? 0);
        const type = (t.type || "").toString().toUpperCase();
        const category = (t.categoryName || t.category || "Sem categoria").toString();
        const iso = toISO(t.date) || toISO(t.createdAt) || null;

        return {
          description: (t.description || "").toString(),
          amount: isFinite(amount) ? amount : 0,
          type,
          category,
          date: iso,
        };
      })
      .filter((t: any) => t.amount !== 0);

    const expenses = normalized.filter((t: any) => t.type === "EXPENSE");
    const incomes = normalized.filter((t: any) => t.type === "INCOME");

    const totalExpense = sum(expenses.map((t: any) => t.amount));
    const totalIncome = sum(incomes.map((t: any) => t.amount));

    const byCategory: Record<string, number> = {};
    for (const t of expenses)
      byCategory[t.category] =
        (byCategory[t.category] || 0) + t.amount;

    const byMonth: Record<string, number> = {};
    for (const t of expenses) {
      const mk = t.date ? monthKey(t.date) : "Sem data";
      byMonth[mk] = (byMonth[mk] || 0) + t.amount;
    }

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));

    const topExpenses = expenses
      .slice()
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5)
      .map((t: any) => ({
        description: t.description || t.category,
        amount: Number(t.amount.toFixed(2)),
        date: t.date,
        category: t.category,
      }));

    const metrics = {
      totals: {
        income: Number(totalIncome.toFixed(2)),
        expense: Number(totalExpense.toFixed(2)),
      },
      topCategories,
      topExpenses,
      months: Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, value]) => ({
          month,
          value: Number(value.toFixed(2)),
        })),
    };

    const sample = normalized
      .slice()
      .sort((a: any, b: any) =>
        (b.date || "").localeCompare(a.date || "")
      )
      .slice(0, 60);

    const ai = new GoogleGenAI({ apiKey });

    const response = await generateWithRetry(ai, {
      contents: [
        `Você é o Consultor AI do SmartFinance. Responda em português (Portugal). Moeda: Euro (€).`,
        `Regras:
- Não usar Markdown.
- Ser direto e prático.
- Usar números reais do extrato quando possível.
`,
        `Resumo:
Receitas: €${metrics.totals.income}
Despesas: €${metrics.totals.expense}
Top categorias: ${JSON.stringify(metrics.topCategories)}
Top despesas: ${JSON.stringify(metrics.topExpenses)}
Despesas por mês: ${JSON.stringify(metrics.months)}
`,
        `Transações recentes: ${JSON.stringify(sample)}`,
        `Pergunta: ${query}`,
      ].join("\n\n"),
    });

    return res.status(200).json({
      text: cleanAIText(response.text),
      metrics,
    });
  } catch (e: any) {
    console.error("API /api/chat ERROR:", e);

    if (isOverloadError(e)) {
      return res.status(503).json({
        error:
          "O consultor AI está com muita procura neste momento. Tenta novamente em alguns segundos.",
      });
    }

    return res.status(500).json({
      error: e?.message || "Internal Error",
    });
  }
}