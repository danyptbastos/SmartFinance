import { Category, Account, Transaction, Goal, Debt } from "./types";

export const CATEGORIES: Category[] = [
  { id: "cat_1", name: "Alimentação", icon: "Utensils", color: "text-orange-400 bg-orange-400/10", budget: 800 },
  { id: "cat_2", name: "Transporte", icon: "Car", color: "text-blue-400 bg-blue-400/10", budget: 300 },
  { id: "cat_3", name: "Lazer", icon: "Gamepad2", color: "text-purple-400 bg-purple-400/10", budget: 250 },
  { id: "cat_4", name: "Saúde", icon: "Activity", color: "text-red-400 bg-red-400/10", budget: 150 },
  { id: "cat_5", name: "Salário", icon: "DollarSign", color: "text-[#A3FF47] bg-[#A3FF47]/10" },
  { id: "cat_6", name: "Moradia", icon: "Home", color: "text-cyan-400 bg-cyan-400/10", budget: 1500 },
  { id: "cat_7", name: "Educação", icon: "BookOpen", color: "text-yellow-400 bg-yellow-400/10", budget: 400 },
  { id: "cat_8", name: "Outros", icon: "Layers", color: "text-zinc-400 bg-zinc-400/10", budget: 200 },
];

// ✅ Sem dados fake (vai ficar tudo vazio até você criar/guardar de verdade)
export const INITIAL_ACCOUNTS: Account[] = [];
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_DEBTS: Debt[] = [];
export const UPCOMING_BILLS: any[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];