
import { Category, Account, Transaction, TransactionType, Goal, Debt } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Alimentação', icon: 'Utensils', color: 'text-orange-400 bg-orange-400/10', budget: 800 },
  { id: 'cat_2', name: 'Transporte', icon: 'Car', color: 'text-blue-400 bg-blue-400/10', budget: 300 },
  { id: 'cat_3', name: 'Lazer', icon: 'Gamepad2', color: 'text-purple-400 bg-purple-400/10', budget: 250 },
  { id: 'cat_4', name: 'Saúde', icon: 'Activity', color: 'text-red-400 bg-red-400/10', budget: 150 },
  { id: 'cat_5', name: 'Salário', icon: 'DollarSign', color: 'text-[#A3FF47] bg-[#A3FF47]/10' },
  { id: 'cat_6', name: 'Moradia', icon: 'Home', color: 'text-cyan-400 bg-cyan-400/10', budget: 1500 },
  { id: 'cat_7', name: 'Educação', icon: 'BookOpen', color: 'text-yellow-400 bg-yellow-400/10', budget: 400 },
  { id: 'cat_8', name: 'Outros', icon: 'Layers', color: 'text-zinc-400 bg-zinc-400/10', budget: 200 },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Carteira', type: 'CASH', balance: 50.00 },
  { id: 'acc_2', name: 'Revolut Principal', type: 'BANK', balance: 2450.40 },
  { id: 'acc_3', name: 'Cartão de Crédito', type: 'CREDIT_CARD', balance: -450.00 },
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g_1', name: 'Fundo de Emergência', targetAmount: 5000, currentAmount: 1200, deadline: '2025-12-31', icon: 'ShieldCheck', color: 'bg-blue-500' },
  { id: 'g_2', name: 'Viagem Japão', targetAmount: 3500, currentAmount: 450, deadline: '2026-06-15', icon: 'Plane', color: 'bg-purple-500' },
  { id: 'g_3', name: 'MacBook Pro', targetAmount: 2400, currentAmount: 2400, deadline: '2024-05-01', icon: 'Laptop', color: 'bg-[#A3FF47]' },
];

export const INITIAL_DEBTS: Debt[] = [
  { id: 'd_1', name: 'Empréstimo Automóvel', totalAmount: 12000, paidAmount: 3500, dueDate: '2025-10-15', lender: 'Santander', status: 'active' },
  { id: 'd_2', name: 'Cartão de Crédito Atrasado', totalAmount: 850, paidAmount: 0, dueDate: '2025-05-20', lender: 'Nubank', status: 'active' },
];

export const UPCOMING_BILLS = [
  { id: 'b1', name: 'Netflix Premium', amount: 17.99, dueDate: 'Amanhã', urgent: true },
  { id: 'b2', name: 'Renda Apt', amount: 950.00, dueDate: 'Em 5 dias', urgent: false },
  { id: 'b3', name: 'Internet Vodafone', amount: 39.90, dueDate: 'Em 12 dias', urgent: false },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't_1',
    date: new Date().toISOString(),
    description: 'Assinatura Spotify',
    amount: 10.99,
    type: TransactionType.EXPENSE,
    categoryId: 'cat_3',
    accountId: 'acc_2'
  },
  {
    id: 't_2',
    date: new Date().toISOString(),
    description: 'Salário Empresa Tech',
    amount: 3200.00,
    type: TransactionType.INCOME,
    categoryId: 'cat_5',
    accountId: 'acc_2'
  },
  {
    id: 't_3',
    date: new Date().toISOString(),
    description: 'Condomínio',
    amount: 85.00,
    type: TransactionType.EXPENSE,
    categoryId: 'cat_6',
    accountId: 'acc_2'
  },
  {
    id: 't_4',
    date: new Date().toISOString(),
    description: 'Jantar Restaurante',
    amount: 45.00,
    type: TransactionType.EXPENSE,
    categoryId: 'cat_1',
    accountId: 'acc_2'
  },
];
