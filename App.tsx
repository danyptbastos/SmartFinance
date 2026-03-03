
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  Wallet, 
  TrendingUp,
  BrainCircuit,
  X,
  Send,
  Loader2,
  Mic,
  ExternalLink,
  Target,
  Sparkles,
  MessageCircle,
  TrendingDown,
  Repeat,
  CreditCard,
  Search,
  Bell,
  ChevronRight,
  Activity,
  Zap,
  Folder,
  Calendar,
  Grid,
  ArrowUpCircle,
  ArrowDownCircle,
  Layers,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Award,
  Trophy,
  Rocket,
  Check,
  Clock,
  Utensils,
  Car,
  Gamepad2,
  Home,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Plane,
  Laptop,
  MoreHorizontal,
  Scale,
  Edit2,
  Trash2,
  ArrowUpRight,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Star,
  Shield,
  Cpu,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Dna,
  Infinity as InfinityIcon,
  MousePointer2,
  Terminal,
  ArrowLeftRight
} from 'lucide-react';
import { Transaction, TransactionType, Category, Goal, Debt, Account } from './types';
import { CATEGORIES as INITIAL_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, UPCOMING_BILLS, INITIAL_GOALS, INITIAL_DEBTS } from './constants';
import { parseTransactionWithAI, chatWithFinancialAI, getHealthDiagnosis } from './geminiService';
import VoiceAssistant from './VoiceAssistant';

const STORAGE_PREFIX = "sf_v1";

function userKey(email?: string) {
  const safe = (email || "guest").trim().toLowerCase();
  return `${STORAGE_PREFIX}:${safe}`;
}

function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function storageClearUser(email?: string) {
  const prefix = userKey(email) + ":";
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(prefix)) localStorage.removeItem(k);
  });
}

// --- Componentes de UI ---

interface GlowCardProps {
  children?: React.Key | React.ReactElement | null | undefined | any;
  className?: string;
  onClick?: () => void;
  key?: React.Key;
}

const GlowCard = ({ children, className = "", onClick }: GlowCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };
  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onClick={onClick} className={`glow-card ${className} ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="glow-card-border" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

const CategoryIcon = ({ iconName, size = 18, className = "" }: { iconName: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = {
    Utensils, Car, Gamepad2, Activity, DollarSign, Home, BookOpen, Layers, ShieldCheck, Plane, Laptop, Target, Trophy, Rocket, CreditCard, Award, Zap
  };
  const IconComponent = icons[iconName] || MoreHorizontal;
  return <IconComponent size={size} className={className} />;
};

const HealthScore = ({ score, onClick }: { score: number, onClick: () => void }) => {
  const color = score >= 80 ? "#A3FF47" : score >= 50 ? "#3b82f6" : "#ef4444";
  return (
    <button onClick={onClick} className="flex items-center gap-4 bg-white/[0.02] p-3 px-6 rounded-[22px] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] transition-all group">
      <div className="text-left">
        <div className="flex items-center gap-2">
          <Activity size={12} style={{ color }} />
          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Neural Status</p>
        </div>
        <h3 className="text-[11px] font-black text-white uppercase">{score >= 80 ? 'EXCELENTE' : score >= 50 ? 'ESTÁVEL' : 'CRÍTICO'}</h3>
      </div>
      <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <ChevronRight size={14} className="text-zinc-600" />
    </button>
  );
};

// --- Componentes Específicos da Landing ---

const TraditionalVsNeural = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pos = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };
  
  return (
    <section className="py-40 px-6 md:px-20 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-24 space-y-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">O Caos vs. <span className="text-[#A3FF47]">A Ordem.</span></h2>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium italic">Pare de lutar contra planilhas. Comece a viver com inteligência.</p>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl mx-auto h-[500px] rounded-[32px] overflow-hidden border border-white/10 glass-card cursor-none group"
      >
        {/* Lado Tradicional */}
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center p-12 text-zinc-500 grayscale opacity-40">
           <div className="w-full space-y-4 font-mono text-[10px]">
              <p>EXCEL_DASHBOARD_V1_FINAL_REVISADO.XLSX</p>
              <div className="grid grid-cols-4 gap-2 border border-zinc-800 p-4">
                 {Array.from({length: 24}).map((_, i) => <div key={i} className="h-4 bg-zinc-800 rounded"></div>)}
              </div>
              <p className="text-red-500">Erro #REF! na linha 442</p>
              <div className="h-20 border border-dashed border-zinc-800 rounded flex items-center justify-center italic">Gráfico Indisponível</div>
              <p>Ultima atualização: 3 meses atrás</p>
           </div>
        </div>

        {/* Lado Neural */}
        <div 
          className="absolute inset-0 bg-[#080808] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <div className="w-full p-12 space-y-8">
             <div className="flex justify-between items-end">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-[#A3FF47] uppercase tracking-widest">Neural Forecast</p>
                   <h4 className="text-4xl font-black italic">PROJEÇÃO: € 4.250,00</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#A3FF47]/10 flex items-center justify-center text-[#A3FF47]"><TrendingUp /></div>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <GlowCard className="p-6 border-[#A3FF47]/20 bg-[#A3FF47]/5">
                   <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Status</p>
                   <p className="text-xs font-black text-[#A3FF47]">OTIMIZADO</p>
                </GlowCard>
                <GlowCard className="p-6">
                   <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Economia</p>
                   <p className="text-xs font-black">+€ 152,00</p>
                </GlowCard>
                <GlowCard className="p-6">
                   <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Alertas</p>
                   <p className="text-xs font-black">0</p>
                </GlowCard>
             </div>
             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#A3FF47] to-blue-500 w-3/4" /></div>
          </div>
        </div>

        {/* Slider Handle (Follows Mouse) */}
        <div 
          className="absolute inset-y-0 w-1 bg-[#A3FF47] z-30 shadow-[0_0_20px_#A3FF47] transition-transform duration-75 ease-out"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#A3FF47] text-black rounded-full flex items-center justify-center shadow-xl">
             <ArrowLeftRight size={20} />
          </div>
          <div className="absolute top-4 left-4 whitespace-nowrap bg-[#A3FF47] text-black text-[10px] font-black px-2 py-1 rounded hidden md:block" style={{ transform: 'translateX(-110%)' }}>PASSADO</div>
          <div className="absolute top-4 right-4 whitespace-nowrap bg-black text-[#A3FF47] text-[10px] font-black px-2 py-1 rounded hidden md:block" style={{ transform: 'translateX(110%)' }}>FUTURO</div>
        </div>
      </div>
    </section>
  );
};

const DemoTerminal = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoQuery = () => {
    if (!query) return;
    setLoading(true);
    setResponse(null);
    setTimeout(() => {
      setLoading(false);
      const lowQuery = query.toLowerCase();
      if (lowQuery.includes('café')) setResponse('Calculando... Com base na média de €3,50/dia, você gastaria €1.277,50 por ano. Em 5 anos, isso renderia €7.200,00 se investido a 4% a.a.');
      else if (lowQuery.includes('viagem')) setResponse('Analisando metas... Para uma viagem de €5.000 em 12 meses, você precisa poupar €416,67/mês. Sua média de economia atual é €600,00. Status: POSSÍVEL.');
      else if (lowQuery.includes('iphone')) setResponse('Alerta de Impulso! Detectado que essa compra compromete 15% do seu fundo de emergência. Sugiro esperar a promoção da Black Friday.');
      else setResponse('Neural AI pronta. Detectei um potencial de economia de 18% mudando pequenas assinaturas recorrentes. Quer que eu as liste?');
    }, 1500);
  };

  return (
    <section className="py-40 px-6 md:px-20 max-w-7xl mx-auto">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
             <div className="w-16 h-16 bg-[#A3FF47]/10 rounded-2xl flex items-center justify-center text-[#A3FF47]"><Terminal size={32} /></div>
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">O Momento <br /> <span className="text-[#A3FF47]">"Aha!".</span></h2>
             <p className="text-zinc-500 text-lg font-medium leading-relaxed">Não acredite em nós. Pergunte à nossa IA agora mesmo. Ela já está processando trilhões de cenários financeiros para você.</p>
             <div className="flex flex-wrap gap-2 pt-4">
                {['Média de gastos com Café?', 'Posso viajar ano que vem?', 'Devo comprar um iPhone?'].map(txt => (
                  <button key={txt} onClick={() => setQuery(txt)} className="px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:border-[#A3FF47]/40 hover:text-[#A3FF47] transition-all">"{txt}"</button>
                ))}
             </div>
          </div>
          
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-[#A3FF47] to-blue-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
             <div className="relative glass-card bg-black border border-white/10 p-10 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-10">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   <span className="ml-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neural Terminal v3.0</span>
                </div>
                
                <div className="flex-1 space-y-6 overflow-y-auto">
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black">USER</div>
                      <div className="flex-1">
                         <input 
                           type="text" 
                           value={query} 
                           onChange={e => setQuery(e.target.value)} 
                           onKeyDown={e => e.key === 'Enter' && handleDemoQuery()}
                           placeholder="Digite sua dúvida financeira..." 
                           className="w-full bg-transparent border-b border-white/5 py-1 text-sm outline-none focus:border-[#A3FF47]/50 transition-all font-mono"
                         />
                      </div>
                   </div>

                   {loading && (
                      <div className="flex gap-4 animate-in fade-in">
                         <div className="w-8 h-8 rounded-lg bg-[#A3FF47]/10 flex items-center justify-center text-[#A3FF47]"><BrainCircuit size={14} className="animate-spin" /></div>
                         <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/5 w-3/4 animate-pulse rounded" />
                            <div className="h-4 bg-white/5 w-1/2 animate-pulse rounded" />
                         </div>
                      </div>
                   )}

                   {response && (
                      <div className="flex gap-4 animate-in slide-in-from-left-4">
                         <div className="w-8 h-8 rounded-lg bg-[#A3FF47]/10 flex items-center justify-center text-[#A3FF47]"><Sparkles size={14} /></div>
                         <div className="flex-1 bg-[#A3FF47]/5 p-6 rounded-2xl border border-[#A3FF47]/10">
                            <p className="text-zinc-300 font-medium leading-relaxed italic">{response}</p>
                         </div>
                      </div>
                   )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Status: Conexão Segura AES-256</p>
                   <button onClick={handleDemoQuery} className="p-3 bg-[#A3FF47] text-black rounded-xl hover:scale-105 transition-all"><Send size={18} /></button>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};

const App: React.FC = () => {
  // Controle de Navegação Principal
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  
  // Estado de Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  // Estados da Plataforma Financeira

// 1) primeiro o currentUserEmail
const [currentUserEmail, setCurrentUserEmail] = useState<string>(() =>
  storageGet(`${STORAGE_PREFIX}:currentUser`, "guest")
);

// 2) depois o baseKey (derivado)
const baseKey = userKey(currentUserEmail);

// começa LIMPO (sem seeds fake)
const [transactions, setTransactions] = useState<Transaction[]>(() =>
  storageGet(`${baseKey}:transactions`, [])
);

const [categories, setCategories] = useState<Category[]>(() =>
  storageGet(`${baseKey}:categories`, INITIAL_CATEGORIES)
);

const [goals, setGoals] = useState<Goal[]>(() =>
  storageGet(`${baseKey}:goals`, [])
);

const [debts, setDebts] = useState<Debt[]>(() =>
  storageGet(`${baseKey}:debts`, [])
);

const [accounts, setAccounts] = useState<Account[]>(() =>
  storageGet(`${baseKey}:accounts`, [])
);

useEffect(() => { storageSet(`${baseKey}:transactions`, transactions); }, [baseKey, transactions]);
useEffect(() => { storageSet(`${baseKey}:categories`, categories); }, [baseKey, categories]);
useEffect(() => { storageSet(`${baseKey}:goals`, goals); }, [baseKey, goals]);
useEffect(() => { storageSet(`${baseKey}:debts`, debts); }, [baseKey, debts]);
useEffect(() => { storageSet(`${baseKey}:accounts`, accounts); }, [baseKey, accounts]);
useEffect(() => {
  storageSet(`${STORAGE_PREFIX}:currentUser`, currentUserEmail);
}, [currentUserEmail]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'chat' | 'goals' | 'debts'>('dashboard');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'manual' | 'budget' | 'pay_debt' | 'health' | 'new_debt' | 'new_goal' | 'contribute_goal'>('manual');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Estados para Filtro de Histórico
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  // Formulário de Transação
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [newTAmount, setNewTAmount] = useState('');
  const [newTDesc, setNewTDesc] = useState('');
  const [newTCat, setNewTCat] = useState('cat_1');
  const [newTAccount, setNewTAccount] = useState('acc_1');
  const [newTType, setNewTType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newTDate, setNewTDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('1');

  // Edição de Orçamento e Dívida
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Estados para Nova Dívida
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtLender, setNewDebtLender] = useState('');
  const [newDebtTotal, setNewDebtTotal] = useState('');
  const [newDebtDueDate, setNewDebtDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados para Nova Meta
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newGoalIcon, setNewGoalIcon] = useState('Target');
  const [newGoalColor, setNewGoalColor] = useState('bg-blue-500');

  // Estado para Aportar na Meta
  const [selectedGoalToContribute, setSelectedGoalToContribute] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const summary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  const debtSummary = useMemo(() => {
    const total = debts.reduce((acc, d) => acc + d.totalAmount, 0);
    const paid = debts.reduce((acc, d) => acc + d.paidAmount, 0);
    return { total, paid, remaining: total - paid };
  }, [debts]);

  const budgetProgress = useMemo(() => {
    return categories.filter(c => c.budget !== undefined).map(cat => {
      const spent = transactions
        .filter(t => t.categoryId === cat.id && t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + t.amount, 0);
      const percent = (spent / (cat.budget || 1)) * 100;
      return { ...cat, spent, percent };
    }).sort((a, b) => b.percent - a.percent);
  }, [transactions, categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date).getTime();
        const start = historyStartDate ? new Date(historyStartDate).getTime() : -Infinity;
        const endOfDay = historyEndDate ? new Date(historyEndDate).setHours(23, 59, 59, 999) : Infinity;
        return tDate >= start && tDate <= endOfDay;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, historyStartDate, historyEndDate]);

  const score = useMemo(() => {
    let s = 80;
    const overBudgets = categories.filter(c => {
      if (c.budget === undefined) return false;
      const spent = transactions.filter(t => t.categoryId === c.id && t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
      return spent > c.budget;
    }).length;
    s -= overBudgets * 10;
    if (summary.totalIncome > 0 && (summary.totalExpense / summary.totalIncome) > 1) s -= 30;
    return Math.max(0, Math.min(100, s));
  }, [transactions, summary, categories]);

  const resetForm = () => {
    setNewTAmount(''); setNewTDesc(''); setNewTCat('cat_1'); setNewTAccount('acc_1');
    setNewTType(TransactionType.EXPENSE); setNewTDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false); setIsInstallment(false); setTotalInstallments('1');
    setEditingCategoryId(null); setNewBudgetAmount(''); setSelectedDebtToPay(null); setPayAmount('');
    setNewDebtName(''); setNewDebtLender(''); setNewDebtTotal(''); setNewDebtDueDate(new Date().toISOString().split('T')[0]);
    setEditingDebtId(null);
    setNewGoalName(''); setNewGoalTarget(''); setNewGoalCurrent(''); setNewGoalDeadline(new Date().toISOString().split('T')[0]);
    setNewGoalIcon('Target'); setNewGoalColor('bg-blue-500'); setEditingGoalId(null);
    setSelectedGoalToContribute(null); setContributionAmount('');
    setEditingTransactionId(null);
  };

  const resetUserData = () => {
  if (!window.confirm("Queres mesmo limpar tudo desta conta?")) return;

  storageClearUser(currentUserEmail);

  setTransactions([]);
  setGoals([]);
  setDebts([]);
  setAccounts([]);
  setCategories(INITIAL_CATEGORIES);

  resetForm();
};

  const handleManualSubmit = () => {
    if (!newTAmount || !newTDesc) {
      alert('Por favor, preencha o valor e a descrição.');
      return;
    }
    
    const amount = parseFloat(newTAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    try {
      const transData = {
        date: newTDate ? new Date(newTDate).toISOString() : new Date().toISOString(),
        description: newTDesc,
        amount: amount,
        type: newTType,
        categoryId: newTCat,
        accountId: newTAccount,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        installments: isInstallment ? { current: 1, total: parseInt(totalInstallments) || 1 } : undefined
      };

      if (editingTransactionId) {
        setTransactions(prev => prev.map(t => t.id === editingTransactionId ? { ...t, ...transData } : t));
      } else {
        const trans: Transaction = { id: `t_${Date.now()}`, ...transData };
        setTransactions(prev => [trans, ...prev]);
      }
      
      setIsAiModalOpen(false);
      setActiveTab('transactions');
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Ocorreu um erro ao salvar a transação. Verifique os dados e tente novamente.');
    }
  };

  const handleCreateDebt = () => {
    if (!newDebtName || !newDebtTotal || !newDebtLender) return;
    if (editingDebtId) {
      setDebts(prev => prev.map(d => d.id === editingDebtId ? {
        ...d,
        name: newDebtName,
        lender: newDebtLender,
        totalAmount: parseFloat(newDebtTotal),
        dueDate: newDebtDueDate
      } : d));
    } else {
      const debt: Debt = {
        id: `d_${Date.now()}`,
        name: newDebtName,
        lender: newDebtLender,
        totalAmount: parseFloat(newDebtTotal),
        paidAmount: 0,
        dueDate: newDebtDueDate,
        status: 'active'
      };
      setDebts(prev => [debt, ...prev]);
    }
    setIsAiModalOpen(false);
    resetForm();
  };

  const handleCreateGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    const goalData = {
      name: newGoalName,
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: parseFloat(newGoalCurrent || '0'),
      deadline: newGoalDeadline,
      icon: newGoalIcon,
      color: newGoalColor,
    };
    if (editingGoalId) {
      setGoals(prev => prev.map(g => g.id === editingGoalId ? { ...g, ...goalData } : g));
    } else {
      const goal: Goal = { id: `g_${Date.now()}`, ...goalData };
      setGoals(prev => [goal, ...prev]);
    }
    setIsAiModalOpen(false);
    resetForm();
  };

  const handleContributeGoal = () => {
    if (!selectedGoalToContribute || !contributionAmount) return;
    const amount = parseFloat(contributionAmount);
    setGoals(prev => prev.map(g => {
      if (g.id === selectedGoalToContribute.id) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));
    setTransactions(prev => [{
      id: `t_${Date.now()}`,
      description: `Aporte: ${selectedGoalToContribute.name}`,
      amount: amount,
      type: TransactionType.EXPENSE,
      categoryId: 'cat_8',
      accountId: 'acc_1',
      date: new Date().toISOString()
    }, ...prev]);
    setIsAiModalOpen(false);
    resetForm();
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta dívida?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta meta?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleUpdateBudget = () => {
    if (!editingCategoryId) return;
    const amount = parseFloat(newBudgetAmount);
    setCategories(prev => prev.map(c => c.id === editingCategoryId ? { ...c, budget: isNaN(amount) ? undefined : amount } : c));
    setIsAiModalOpen(false);
    resetForm();
  };

  const handlePayDebt = () => {
    if (!selectedDebtToPay || !payAmount) return;
    const amount = parseFloat(payAmount);
    setDebts(prev => prev.map(d => {
      if (d.id === selectedDebtToPay.id) {
        const newPaid = d.paidAmount + amount;
        return { ...d, paidAmount: newPaid, status: newPaid >= d.totalAmount ? 'paid' : 'active' };
      }
      return d;
    }));
    setTransactions(prev => [{
      id: `t_${Date.now()}`,
      description: `Pagamento: ${selectedDebtToPay.name}`,
      amount: amount,
      type: TransactionType.EXPENSE,
      categoryId: 'cat_8',
      accountId: 'acc_1',
      date: new Date().toISOString()
    }, ...prev]);
    setIsAiModalOpen(false);
    resetForm();
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput; setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    const response = await chatWithFinancialAI(chatMessages, userText, transactions);
    setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiLoading(true);
  
    const email = authEmail.trim().toLowerCase();
  
    setTimeout(() => {
      setIsAiLoading(false);
  
      setCurrentUserEmail(email);
      localStorage.setItem(`${STORAGE_PREFIX}:currentUser`, email);
  
      setIsLoggedIn(true);
      setView('app');
    }, 1500);
  };

  // --- LANDING PAGE ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden selection:bg-[#A3FF47] selection:text-black">
        <div className="aura-bg"><div className="aura-blob aura-blob-1" /><div className="aura-blob aura-blob-2" /></div>
        
        {/* Modern Header */}
        <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-[100] flex items-center justify-between px-6 md:px-20">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#A3FF47]/50 transition-all">
               <div className="w-5 h-5 bg-white rounded-sm rotate-45 flex items-center justify-center transition-transform group-hover:rotate-90"><div className="w-2 h-2 bg-black rounded-full"></div></div>
             </div>
             <span className="font-black text-2xl tracking-tighter italic">SmartFinance</span>
          </div>
          <div className="hidden lg:flex items-center gap-12">
            {['Funcionalidades', 'Comparador', 'Demonstração', 'Preços'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace('ã', 'a').replace(' ', '-')}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#A3FF47] transition-all relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#A3FF47] hover:after:w-full after:transition-all">
                {item}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-white/10" />
            <button onClick={() => setView('auth')} className="text-[10px] font-black uppercase tracking-widest text-white px-8 py-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:scale-105 transition-all">Entrar</button>
            <button onClick={() => setView('auth')} className="btn-primary px-10 py-3.5 text-[10px] uppercase tracking-[0.2em] shadow-lg">Começar Agora</button>
          </div>
          <button className="lg:hidden p-2 text-zinc-400"><Grid size={24} /></button>
        </nav>

        {/* Hero Section 2.0 */}
        <header className="relative pt-48 pb-32 px-6 md:px-20 flex flex-col items-center text-center bg-grid overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A3FF47]/5 border border-[#A3FF47]/20 rounded-full mb-10 animate-bounce duration-[3000ms]">
            <Sparkles size={14} className="text-[#A3FF47]" />
            <span className="text-[10px] font-black uppercase text-[#A3FF47] tracking-[0.3em] italic">O Futuro das Finanças Pessoais</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] max-w-6xl mb-12 animate-gradient-text drop-shadow-2xl">
            Sua mente financeira <br /> <span className="text-white">em potência máxima.</span>
          </h1>
          
          <p className="text-zinc-400 text-xl md:text-2xl font-medium max-w-3xl leading-relaxed mb-16 px-4">
            A primeira plataforma de gestão neural que utiliza inteligência preditiva para antecipar gastos, automatizar economias e elevar seu patrimônio ao próximo nível.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 z-10">
            <button onClick={() => setView('auth')} className="btn-primary px-16 py-6 text-sm uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(163,255,71,0.25)] flex items-center gap-3">
              Criar Conta Grátis <ArrowRight size={20} />
            </button>
            <button className="px-16 py-6 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-3">
              <Zap size={20} className="text-[#A3FF47]" /> Agendar Demo
            </button>
          </div>
        </header>

        {/* Bento Grid Features */}
        <section id="funcionalidades" className="py-40 px-6 md:px-20 max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">O Futuro é agora.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">Tecnologia de ponta desenhada para quem não aceita nada menos que a excelência.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            <GlowCard className="md:col-span-8 md:row-span-2 p-12 flex flex-col justify-between overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <InfinityIcon size={300} className="text-[#A3FF47]" />
              </div>
              <div className="relative space-y-6 max-w-md">
                <div className="w-16 h-16 bg-[#A3FF47]/10 rounded-2xl flex items-center justify-center text-[#A3FF47] border border-[#A3FF47]/20 group-hover:scale-110 transition-all">
                  <BrainCircuit size={32} />
                </div>
                <h3 className="text-4xl font-black uppercase italic leading-tight">Inteligência <br /> <span className="text-[#A3FF47]">Preditiva</span></h3>
                <p className="text-zinc-400 text-lg leading-relaxed">Nossa rede neural aprende seus hábitos em 7 dias e começa a sugerir economias reais.</p>
              </div>
            </GlowCard>
            <GlowCard className="md:col-span-4 md:row-span-2 p-12 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-all">
                  <Mic size={32} />
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-tight">Comandos <br /> Vocais</h3>
                <p className="text-zinc-500 font-medium">Fale como se estivesse com seu consultor particular. Registro instantâneo.</p>
              </div>
            </GlowCard>
          </div>
        </section>

        {/* NOVO: Comparador Tradicional vs. Neural com Movimento Follow Mouse */}
        <div id="comparador">
           <TraditionalVsNeural />
        </div>

        {/* NOVO: Terminal de Demonstração */}
        <div id="demonstracao">
           <DemoTerminal />
        </div>

        {/* Pricing Section */}
        <section id="preços" className="py-40 px-6 md:px-20 bg-gradient-to-b from-transparent to-[#A3FF47]/5">
           <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">O Preço da Liberdade.</h2>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">Planos desenhados para todos os níveis de ambição financeira.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              <div className="glass-card p-12 space-y-10 group hover:translate-y-[-10px] transition-all">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Starter Core</p>
                  <h3 className="text-5xl font-black italic">GRÁTIS</h3>
                </div>
                <ul className="space-y-6">
                  {['Histórico Ilimitado', '3 Metas Ativas', 'Modo Stealth Básico'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium text-zinc-400 italic"><Check size={18} className="text-[#A3FF47]" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => setView('auth')} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Escolher Starter</button>
              </div>
              
              <div className="glass-card p-12 space-y-10 border-[#A3FF47]/20 relative overflow-hidden pricing-border-flow scale-105 z-10 bg-black">
                <div className="absolute top-0 right-0 bg-[#A3FF47] text-black text-[10px] font-black px-6 py-2.5 uppercase tracking-widest rounded-bl-2xl italic">Melhor Evolução</div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#A3FF47]">Pro Neural</p>
                  <h3 className="text-6xl font-black italic tracking-tighter">€ 9<span className="text-2xl">,90/mês</span></h3>
                </div>
                <ul className="space-y-6">
                  {['Assistente de Voz Ativo', 'IA Preditiva Ilimitada', 'Consultor AI 24/7'].map(f => (
                    <li key={f} className="flex items-center gap-4 text-md font-black italic tracking-tight"><Check size={20} className="text-[#A3FF47]" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => setView('auth')} className="w-full btn-primary py-6 text-[11px] uppercase tracking-[0.4em] shadow-xl">Ativar Protocolo Pro</button>
              </div>

              <div className="glass-card p-12 space-y-10 group hover:translate-y-[-10px] transition-all">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Infinite Business</p>
                  <h3 className="text-5xl font-black italic tracking-tighter">€ 24<span className="text-2xl">,90/mês</span></h3>
                </div>
                <ul className="space-y-6">
                  {['Multi-moedas (€/$/£)', 'Exportação Fiscal', 'Usuários Compartilhados'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium text-zinc-400 italic"><Check size={18} className="text-[#A3FF47]" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => setView('auth')} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Escalar Negócio</button>
              </div>
            </div>
          </div>
        </section>

        {/* Improved Footer */}
        <footer className="py-32 px-6 md:px-20 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <div className="w-5 h-5 bg-white rounded-sm rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-black rounded-full"></div></div>
                </div>
                <span className="font-black text-2xl tracking-tighter italic">SmartFinance</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">SmartFinance AI © 2025. O futuro é neural.</p>
          </div>
        </footer>
      </div>
    );
  }

  // --- TELA DE LOGIN/CADASTRO ---
  if (view === 'auth') {
    return (
      <div className="flex h-screen bg-[#080808] text-white overflow-hidden font-inter">
        <div className="aura-bg"><div className="aura-blob aura-blob-1" /><div className="aura-blob aura-blob-2" /></div>
        
        <div className="w-full flex items-center justify-center p-6 z-10">
          <div className="glass-card w-full max-w-md p-10 space-y-8 animate-in fade-in duration-700">
<button
  onClick={() => {
    setIsLoggedIn(false);
    setView('landing');
  }}
  className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 text-zinc-400 border border-white/5"
>
  <LogOut size={18} />
</button>            <div className="text-center space-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <div className="w-8 h-8 bg-white rounded-sm rotate-45 flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full"></div></div>
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Acesso Neural</h1>
              <p className="text-[10px] font-black uppercase text-[#A3FF47] tracking-[0.5em] animate-pulse">SmartFinance AI v2.0</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nome Completo</p>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#A3FF47] transition-colors" size={18} />
                    <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required placeholder="Seu nome" className="w-full bg-white/5 border border-white/5 group-focus-within:border-[#A3FF47]/30 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Identificação Neural (E-mail)</p>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#A3FF47] transition-colors" size={18} />
                  <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="exemplo@finance.ai" className="w-full bg-white/5 border border-white/5 group-focus-within:border-[#A3FF47]/30 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Chave de Segurança</p>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#A3FF47] transition-colors" size={18} />
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-white/5 border border-white/5 group-focus-within:border-[#A3FF47]/30 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-5 uppercase font-black tracking-[0.3em] text-[11px] flex items-center justify-center gap-2">
                {authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                {authMode === 'login' ? 'Sincronizar Acesso' : 'Gerar Nova Credencial'}
              </button>
            </form>

            <div className="text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white tracking-widest transition-colors">
                {authMode === 'login' ? 'Ainda não possui credencial? Criar agora' : 'Já possui credencial? Fazer Login'}
              </button>
            </div>
          </div>
        </div>

        {isAiLoading && <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center gap-12"><Loader2 className="animate-spin text-[#A3FF47]" size={48} /><p className="font-black text-[#A3FF47] tracking-[0.5em] uppercase text-xs animate-pulse">Neural Syncing...</p></div>}
      </div>
    );
  }

// --- PLATAFORMA PRINCIPAL ---

if (!isLoggedIn) {
  // volta pro login automaticamente
  if (view === 'app') setView('auth');
  return null;
}

return (
  <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
      <div className="aura-bg"><div className="aura-blob aura-blob-1" /><div className="aura-blob aura-blob-2" /></div>

      {isVoiceOpen && <VoiceAssistant onClose={() => setIsVoiceOpen(false)} onTransactionDetected={(text) => { parseTransactionWithAI(text).then(t => t && setTransactions(p => [t, ...p])); setIsVoiceOpen(false); }} />}

      <aside className="hidden lg:flex w-72 bg-[#0B0B0B] border-r border-white/5 flex-col p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10 px-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
             <div className="w-5 h-5 bg-white rounded-sm rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-black rounded-full"></div></div>
          </div>
          <span className="font-bold text-lg tracking-tight">SmartFinance</span>
        </div>

        <div className="flex-1 space-y-8">
          <section>
            <p className="menu-section-title">Menu</p>
            <div className="space-y-1">
              <button onClick={() => setActiveTab('dashboard')} className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-zinc-500 hover:text-white'}`}><LayoutDashboard size={18} /> Visão Geral</button>
              <button onClick={() => setActiveTab('debts')} className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'debts' ? 'nav-item-active' : 'text-zinc-500 hover:text-white'}`}><CreditCard size={18} /> Dívidas</button>
              <button onClick={() => setActiveTab('goals')} className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'goals' ? 'nav-item-active' : 'text-zinc-500 hover:text-white'}`}><Award size={18} /> Metas</button>
              <button onClick={() => setActiveTab('chat')} className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'nav-item-active' : 'text-zinc-500 hover:text-white'}`}><MessageCircle size={18} /> Consultor AI</button>
            </div>
          </section>
          <section>
            <p className="menu-section-title">Registos</p>
            <button onClick={() => setActiveTab('transactions')} className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'transactions' ? 'nav-item-active' : 'text-zinc-500 hover:text-white'}`}><Grid size={18} /> Histórico</button>
          </section>
        </div>

        <div className="mt-auto space-y-4">
        <button
onClick={() => {
  setIsLoggedIn(false);
  setCurrentUserEmail("guest");
  localStorage.removeItem(`${STORAGE_PREFIX}:currentUser`);
  setView('landing');
}}
  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-4"
>
  <LogOut size={16} /> Encerrar Sessão
</button>

          <button onClick={() => { resetForm(); setModalMode('manual'); setIsAiModalOpen(true); }} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-[10px] tracking-widest uppercase">
             <Plus size={18} strokeWidth={3} /> Nova Transação
          </button>
        </div>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-12 pb-32 lg:pb-12 z-10 custom-scrollbar">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2"><Sparkles size={16} className="text-[#A3FF47]" /><span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Neural Interface v2</span></div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">{activeTab === 'dashboard' ? 'Visão Geral' : activeTab === 'transactions' ? 'Histórico' : activeTab === 'debts' ? 'Dívidas' : activeTab === 'goals' ? 'Metas' : 'Chat'}</h1>
              </div>
              {activeTab === 'debts' && (
                <button onClick={() => { resetForm(); setModalMode('new_debt'); setIsAiModalOpen(true); }} className="btn-primary flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.2em] uppercase mt-4">
                  <Plus size={16} strokeWidth={3} /> Nova Dívida
                </button>
              )}
              {activeTab === 'goals' && (
                <button onClick={() => { resetForm(); setModalMode('new_goal'); setIsAiModalOpen(true); }} className="btn-primary flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.2em] uppercase mt-4">
                  <Plus size={16} strokeWidth={3} /> Nova Meta
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
              <button
  onClick={() => {
    setIsLoggedIn(false);
    setView('landing');
  }}
  className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 text-zinc-400 border border-white/5"
>
  <LogOut size={18} />
</button>

              <HealthScore
                score={score}
                onClick={() => {
                  setModalMode('health');
                  setIsAiModalOpen(true);
                }}
              />

              <button
                onClick={() => setIsStealthMode(!isStealthMode)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-white/5 transition-all ${
                  isStealthMode ? 'bg-[#A3FF47]/10 text-[#A3FF47]' : 'bg-white/5 text-zinc-400'
                }`}
                title={isStealthMode ? 'Desativar modo stealth' : 'Ativar modo stealth'}
              >
                {isStealthMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            </div>
            
          {activeTab === 'dashboard' ? (
            <div className="space-y-10 fade-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlowCard className="p-8"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saldo Líquido</p><h4 className={`text-3xl font-black mt-4 ${isStealthMode ? 'blur-md' : ''}`}>€ {summary.balance.toLocaleString()}</h4></GlowCard>
                <GlowCard className="p-8"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Receitas</p><h4 className="text-3xl font-black mt-4 text-[#A3FF47]">€ {summary.totalIncome.toLocaleString()}</h4></GlowCard>
                <GlowCard className="p-8"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Despesas</p><h4 className="text-3xl font-black mt-4 text-orange-400">€ {summary.totalExpense.toLocaleString()}</h4></GlowCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlowCard className="p-10 lg:col-span-2">
                  <div className="flex items-center gap-3 mb-10"><Target size={20} className="text-[#A3FF47]" /><h3 className="font-black text-xl">Radar de Orçamentos</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {budgetProgress.map(cat => (
                      <div key={cat.id} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}><CategoryIcon iconName={cat.icon} size={14} /></div>
                            <span className="text-sm font-bold text-zinc-300">{cat.name}</span>
                            <button onClick={() => { setEditingCategoryId(cat.id); setNewBudgetAmount(cat.budget?.toString() || ''); setModalMode('budget'); setIsAiModalOpen(true); }} className="p-1 hover:text-[#A3FF47] transition-colors text-zinc-600"><Edit2 size={12} /></button>
                          </div>
                          <span className="text-[11px] font-black">€ {cat.spent.toFixed(0)} <span className="text-zinc-600">/ {cat.budget}</span></span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${cat.percent > 90 ? 'bg-red-500' : 'bg-[#A3FF47]'}`} style={{ width: `${Math.min(cat.percent, 100)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </GlowCard>
                <GlowCard className="p-10">
                   <h3 className="font-black text-xl mb-8 flex items-center gap-3"><Scale size={20} className="text-blue-400" /> Neural Stats</h3>
                   <div className="space-y-6">
                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl"><p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Fluxo Diário Sugerido</p><p className="text-2xl font-black text-[#A3FF47]">€ {(summary.balance / 30).toFixed(2)}</p></div>
                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl"><p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Economia Potencial</p><p className="text-2xl font-black text-blue-400">€ {(summary.totalIncome * 0.2).toFixed(2)}</p></div>
                   </div>
                </GlowCard>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <GlowCard className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3"><Clock size={20} className="text-[#A3FF47]" /><h3 className="font-black text-xl">Transações Recentes</h3></div>
                    <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-black uppercase text-[#A3FF47] tracking-widest hover:underline">Ver Tudo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transactions.slice(0, 6).map(t => (
                      <div key={t.id} className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all relative">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categories.find(c => c.id === t.categoryId)?.color || 'bg-zinc-800'}`}><CategoryIcon iconName={categories.find(c => c.id === t.categoryId)?.icon || 'Layers'} size={16} /></div>
                          <div>
                            <p className="text-xs font-bold truncate max-w-[80px]">{t.description}</p>
                            <p className="text-[9px] text-zinc-500 uppercase font-black">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.stopPropagation();
                                setEditingTransactionId(t.id); 
                                setNewTAmount(t.amount.toString()); 
                                setNewTDesc(t.description); 
                                setNewTCat(t.categoryId); 
                                setNewTType(t.type); 
                                setNewTDate(t.date.split('T')[0]); 
                                setIsRecurring(!!t.isRecurring); 
                                setIsInstallment(!!t.installments); 
                                if (t.installments) setTotalInstallments(t.installments.total.toString()); 
                                setModalMode('manual'); 
                                setIsAiModalOpen(true); 
                              }} 
                              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#A3FF47] transition-all"
                              title="Editar"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault();
                                setTransactions(prev => prev.filter(item => item.id !== t.id));
                              }} 
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all relative z-50 cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-[#A3FF47]' : 'text-white'}`}>{t.type === TransactionType.INCOME ? '+' : '-'} € {t.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </div>
            </div>
          ) : activeTab === 'debts' ? (
            <div className="space-y-10 fade-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlowCard className="p-8 border-none bg-red-500/5"><p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Passivo Total</p><h4 className="text-2xl font-black text-red-400">€ {debtSummary.total.toLocaleString()}</h4></GlowCard>
                <GlowCard className="p-8 border-none bg-[#A3FF47]/5"><p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Total Pago</p><h4 className="text-2xl font-black text-[#A3FF47]">€ {debtSummary.paid.toLocaleString()}</h4></GlowCard>
                <GlowCard className="p-8 border-none bg-white/[0.02]"><p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Dívida Ativa</p><h4 className="text-2xl font-black">€ {debtSummary.remaining.toLocaleString()}</h4></GlowCard>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {debts.map(debt => (
                  <GlowCard key={debt.id} className={`p-8 flex flex-col relative ${debt.status === 'paid' ? 'opacity-40' : ''}`}>
                    <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
                       <button 
                         type="button"
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           setEditingDebtId(debt.id); 
                           setNewDebtName(debt.name); 
                           setNewDebtLender(debt.lender); 
                           setNewDebtTotal(debt.totalAmount.toString()); 
                           setNewDebtDueDate(debt.dueDate); 
                           setModalMode('new_debt'); 
                           setIsAiModalOpen(true); 
                         }} 
                         className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#A3FF47] transition-all"
                         title="Editar"
                       >
                         <Edit2 size={14} />
                       </button>
                       <button 
                         type="button"
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           handleDeleteDebt(debt.id); 
                         }} 
                         className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                         title="Excluir"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-400 border border-white/5"><CreditCard size={20} /></div>
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${debt.status === 'paid' ? 'bg-[#A3FF47]/10 text-[#A3FF47]' : 'bg-red-500/10 text-red-500'}`}>{debt.status === 'paid' ? 'Quitada' : 'Ativa'}</span>
                    </div>
                    <h4 className="text-lg font-black truncate">{debt.name}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mb-8">{debt.lender}</p>
                    <div className="mt-auto space-y-4">
                      <div className="flex justify-between items-end"><p className="text-[9px] font-black text-zinc-600 uppercase">Progresso</p><p className="text-[10px] font-black">€ {debt.paidAmount} / {debt.totalAmount}</p></div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full bg-red-400 transition-all duration-1000 ${debt.status === 'paid' ? 'bg-[#A3FF47]' : ''}`} style={{ width: `${(debt.paidAmount/debt.totalAmount)*100}%` }} /></div>
                      {debt.status === 'active' && <button onClick={() => { setSelectedDebtToPay(debt); setModalMode('pay_debt'); setIsAiModalOpen(true); }} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Abater Valor</button>}
                    </div>
                  </GlowCard>
                ))}
              </div>
            </div>
          ) : activeTab === 'goals' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 fade-up">
               {goals.map(goal => (
                 <GlowCard key={goal.id} className="p-8 flex flex-col relative group">
                   <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
                       <button 
                         type="button"
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           setEditingGoalId(goal.id); 
                           setNewGoalName(goal.name); 
                           setNewGoalTarget(goal.targetAmount.toString()); 
                           setNewGoalCurrent(goal.currentAmount.toString()); 
                           setNewGoalDeadline(goal.deadline); 
                           setNewGoalIcon(goal.icon); 
                           setNewGoalColor(goal.color); 
                           setModalMode('new_goal'); 
                           setIsAiModalOpen(true); 
                         }} 
                         className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#A3FF47] transition-all"
                         title="Editar"
                       >
                         <Edit2 size={14} />
                       </button>
                       <button 
                         type="button"
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           handleDeleteGoal(goal.id); 
                         }} 
                         className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                         title="Excluir"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                   <div className={`w-14 h-14 ${goal.color} rounded-2xl flex items-center justify-center text-white mb-6`}><CategoryIcon iconName={goal.icon} size={28} /></div>
                   <h3 className="text-xl font-black mb-1">{goal.name}</h3>
                   <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Calendar size={10} /> Limite: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                   <div className="mt-auto space-y-4">
                     <div className="flex justify-between items-end"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">€ {goal.currentAmount.toLocaleString()}</p><p className="text-[10px] font-black text-zinc-300 uppercase">/ € {goal.targetAmount.toLocaleString()}</p></div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#A3FF47]" style={{ width: `${(goal.currentAmount/goal.targetAmount)*100}%` }} /></div>
                     <button onClick={() => { setSelectedGoalToContribute(goal); setModalMode('contribute_goal'); setIsAiModalOpen(true); }} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"><ArrowUpRight size={14} className="text-[#A3FF47]" /> Aportar</button>
                   </div>
                 </GlowCard>
               ))}
            </div>
          ) : activeTab === 'chat' ? (
            <div className="h-[calc(100vh-250px)] flex flex-col glass-card overflow-hidden fade-up">
              <div className="p-8 border-b border-white/5 flex items-center gap-4"><BrainCircuit size={28} className="text-[#A3FF47]" /><h3 className="font-black text-2xl">Consultor AI</h3></div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">{chatMessages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-6 rounded-2xl ${msg.role === 'user' ? 'bg-[#A3FF47] text-black font-bold' : 'bg-[#181818] text-white border border-white/5'}`}>{msg.text}</div></div>))}</div>
              <div className="p-6 border-t border-white/5 flex gap-4"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSubmit()} className="flex-1 bg-black border border-white/5 rounded-xl px-6 py-4 outline-none" placeholder="Pergunte sobre seus gastos..." /><button onClick={handleChatSubmit} className="bg-[#A3FF47] text-black px-8 rounded-xl font-black"><Send size={20} /></button></div>
            </div>
          ) : (
            <div className="space-y-6 fade-up">
              <div className="flex flex-col md:flex-row gap-4 mb-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex-1 space-y-2">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">De:</p>
                  <input type="date" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Até:</p>
                  <input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                </div>
                <button onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} className="mt-auto px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Limpar Filtros</button>
              </div>
              <div className="space-y-4">
                {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                  <div key={t.id} className="group bg-[#111] p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categories.find(c => c.id === t.categoryId)?.color || 'bg-zinc-800'}`}><CategoryIcon iconName={categories.find(c => c.id === t.categoryId)?.icon || 'Layers'} /></div>
                      <div>
                        <p className="font-bold">{t.description}</p>
                        <div className="flex gap-2 items-center">
                          <p className="text-[10px] uppercase font-black text-zinc-600">{categories.find(c => c.id === t.categoryId)?.name} • {accounts.find(a => a.id === t.accountId)?.name}</p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.type === TransactionType.INCOME ? 'bg-[#A3FF47]/10 text-[#A3FF47]' : 'bg-orange-500/10 text-orange-500'}`}>
                            {t.type === TransactionType.INCOME ? 'Entrada' : 'Saída'}
                          </span>
                          {t.isRecurring && (
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                              <Repeat size={8} /> 
                              {t.frequency === 'daily' ? 'Diário' : t.frequency === 'weekly' ? 'Semanal' : t.frequency === 'monthly' ? 'Mensal' : t.frequency === 'yearly' ? 'Anual' : 'Recurrente'}
                            </span>
                          )}
                          {t.installments && <span className="text-[9px] text-orange-400 font-bold">({t.installments.current}/{t.installments.total})</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation();
                            setEditingTransactionId(t.id); 
                            setNewTAmount(t.amount.toString()); 
                            setNewTDesc(t.description); 
                            setNewTCat(t.categoryId); 
                            setNewTType(t.type); 
                            setNewTDate(t.date.split('T')[0]); 
                            setIsRecurring(!!t.isRecurring); 
                            setIsInstallment(!!t.installments); 
                            if (t.installments) setTotalInstallments(t.installments.total.toString()); 
                            setModalMode('manual'); 
                            setIsAiModalOpen(true); 
                          }} 
                          className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#A3FF47] transition-all"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { 
                            e.stopPropagation();
                            e.preventDefault();
                            setTransactions(prev => prev.filter(item => item.id !== t.id));
                          }} 
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all relative z-50 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className={`font-black ${t.type === TransactionType.INCOME ? 'text-[#A3FF47]' : 'text-white'}`}>{t.type === TransactionType.INCOME ? '+' : '-'} € {t.amount.toFixed(2)}</p>
                        <p className="text-[9px] font-black text-zinc-600 uppercase mt-1">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px] border border-dashed border-white/5 rounded-2xl">Nenhuma transação encontrada no período</div>
                )}
              </div>
            </div>
          )}
          </header>
        </main>

        <aside className="hidden xl:flex w-80 bg-[#0B0B0B] border-l border-white/5 p-10 shrink-0 flex-col overflow-y-auto custom-scrollbar">
           <div className="flex items-center justify-between mb-10 px-2"><p className="text-[11px] font-black text-[#52525B] uppercase tracking-widest">Contas Pendentes</p><Clock size={16} className="text-[#52525B]" /></div>
           <div className="space-y-6">
              {UPCOMING_BILLS.map(bill => (
                <div key={bill.id} className="relative bg-[#111] rounded-[22px] p-6 border border-white/[0.03] overflow-hidden hover:bg-[#151515] transition-all">
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${bill.urgent ? 'bg-red-500' : 'bg-zinc-800'}`}/>
                  <div className="flex justify-between items-start mb-4"><h4 className="text-[13px] font-black uppercase w-2/3 leading-tight">{bill.name}</h4><span className={`text-[13px] font-black ${bill.urgent ? 'text-red-500' : 'text-white'}`}>€ {bill.amount.toFixed(2)}</span></div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600"><Calendar size={12} /><span className="uppercase tracking-widest">{bill.dueDate}</span></div>
                </div>
              ))}
           </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0B0B0B]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-[#A3FF47]' : 'text-zinc-500'}`}>
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'drop-shadow-[0_0_8px_rgba(163,255,71,0.5)]' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
        </button>
        <button onClick={() => setActiveTab('debts')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'debts' ? 'text-[#A3FF47]' : 'text-zinc-500'}`}>
          <CreditCard size={20} className={activeTab === 'debts' ? 'drop-shadow-[0_0_8px_rgba(163,255,71,0.5)]' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest">Dívidas</span>
        </button>
        <div className="relative -mt-10">
          <button onClick={() => { resetForm(); setModalMode('manual'); setIsAiModalOpen(true); }} className="w-14 h-14 bg-[#A3FF47] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(163,255,71,0.3)] transform transition-transform active:scale-90">
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
        <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'goals' ? 'text-[#A3FF47]' : 'text-zinc-500'}`}>
          <Award size={20} className={activeTab === 'goals' ? 'drop-shadow-[0_0_8px_rgba(163,255,71,0.5)]' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest">Metas</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'transactions' ? 'text-[#A3FF47]' : 'text-zinc-500'}`}>
          <Grid size={20} className={activeTab === 'transactions' ? 'drop-shadow-[0_0_8px_rgba(163,255,71,0.5)]' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest">Extra</span>
        </button>
      </nav>

      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="glass-card w-full max-w-2xl overflow-hidden border-white/10 flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h4 className="text-lg font-black uppercase tracking-widest">
                  {modalMode === 'budget' ? 'Ajustar Orçamento' : modalMode === 'pay_debt' ? 'Abater Dívida' : modalMode === 'new_debt' ? (editingDebtId ? 'Editar Dívida' : 'Nova Dívida') : modalMode === 'new_goal' ? (editingGoalId ? 'Editar Meta' : 'Nova Meta') : modalMode === 'contribute_goal' ? 'Novo Aporte' : modalMode === 'manual' ? (editingTransactionId ? 'Editar Registro' : 'Registro Completo') : 'Registro Completo'}
                </h4>
                <button onClick={() => setIsAiModalOpen(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar max-h-[80vh] space-y-8">
                {modalMode === 'manual' ? (
                  <div className="space-y-8">
                    <div className="space-y-4 text-center">
                      <input 
                        type="number" 
                        value={newTAmount} 
                        onChange={e => setNewTAmount(e.target.value)} 
                        placeholder="0.00 €" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-black text-[#A3FF47] outline-none text-center" 
                      />
                      <input 
                        type="text" 
                        value={newTDesc} 
                        onChange={e => setNewTDesc(e.target.value)} 
                        placeholder="O que você comprou ou recebeu?" 
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-[#A3FF47]/30 transition-all" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setNewTType(TransactionType.EXPENSE)}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTType === TransactionType.EXPENSE ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
                      >
                        Despesa
                      </button>
                      <button 
                        onClick={() => setNewTType(TransactionType.INCOME)}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTType === TransactionType.INCOME ? 'bg-[#A3FF47]/10 border-[#A3FF47]/50 text-[#A3FF47]' : 'bg-white/5 border-white/5 text-zinc-500'}`}
                      >
                        Receita
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Categoria</p>
                        <select 
                          value={newTCat} 
                          onChange={e => setNewTCat(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Conta</p>
                        <select 
                          value={newTAccount} 
                          onChange={e => setNewTAccount(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-zinc-900">{acc.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Data</p>
                      <input 
                        type="date" 
                        value={newTDate} 
                        onChange={e => setNewTDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" 
                      />
                    </div>

                    <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Repeat size={18} className={isRecurring ? 'text-blue-400' : 'text-zinc-600'} />
                          <div>
                            <p className="text-xs font-bold">Transação Recurrente</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black">Repetir automaticamente</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsRecurring(!isRecurring)}
                          className={`w-12 h-6 rounded-full relative transition-all ${isRecurring ? 'bg-blue-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRecurring ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      {isRecurring && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                          {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                            <button 
                              key={freq}
                              onClick={() => setFrequency(freq as any)}
                              className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${frequency === freq ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-zinc-600'}`}
                            >
                              {freq === 'daily' ? 'Diário' : freq === 'weekly' ? 'Semanal' : freq === 'monthly' ? 'Mensal' : 'Anual'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Layers size={18} className={isInstallment ? 'text-orange-400' : 'text-zinc-600'} />
                          <div>
                            <p className="text-xs font-bold">Parcelamento</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black">Dividir em várias vezes</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsInstallment(!isInstallment)}
                          className={`w-12 h-6 rounded-full relative transition-all ${isInstallment ? 'bg-orange-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isInstallment ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      {isInstallment && (
                        <div className="pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2 ml-1">Número de Parcelas</p>
                          <input 
                            type="number" 
                            min="1"
                            value={totalInstallments} 
                            onChange={e => setTotalInstallments(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" 
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleManualSubmit(); }} 
                      className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]"
                    >
                      {editingTransactionId ? 'Salvar Alterações' : 'Confirmar Registro'}
                    </button>
                  </div>
                ) : modalMode === 'budget' ? (
                  <div className="space-y-8">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Novo Orçamento Mensal</p>
                      <input 
                        type="number" 
                        value={newBudgetAmount} 
                        onChange={e => setNewBudgetAmount(e.target.value)} 
                        placeholder="0.00 €" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-black text-[#A3FF47] outline-none text-center" 
                      />
                    </div>
                    <button onClick={handleUpdateBudget} className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]">Atualizar Orçamento</button>
                  </div>
                ) : modalMode === 'pay_debt' ? (
                  <div className="space-y-8">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valor do Pagamento</p>
                      <input 
                        type="number" 
                        value={payAmount} 
                        onChange={e => setPayAmount(e.target.value)} 
                        placeholder="0.00 €" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-black text-red-400 outline-none text-center" 
                      />
                    </div>
                    <button onClick={handlePayDebt} className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]">Confirmar Pagamento</button>
                  </div>
                ) : modalMode === 'new_debt' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nome da Dívida</p>
                      <input type="text" value={newDebtName} onChange={e => setNewDebtName(e.target.value)} placeholder="Ex: Empréstimo Carro" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Credor</p>
                      <input type="text" value={newDebtLender} onChange={e => setNewDebtLender(e.target.value)} placeholder="Ex: Banco Santander" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Valor Total</p>
                        <input type="number" value={newDebtTotal} onChange={e => setNewDebtTotal(e.target.value)} placeholder="0.00 €" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Vencimento</p>
                        <input type="date" value={newDebtDueDate} onChange={e => setNewDebtDueDate(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                      </div>
                    </div>
                    <button onClick={handleCreateDebt} className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]">{editingDebtId ? 'Salvar Alterações' : 'Criar Dívida'}</button>
                  </div>
                ) : modalMode === 'new_goal' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nome da Meta</p>
                      <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Ex: Viagem de Férias" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Valor Alvo</p>
                        <input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="0.00 €" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Valor Atual</p>
                        <input type="number" value={newGoalCurrent} onChange={e => setNewGoalCurrent(e.target.value)} placeholder="0.00 €" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Prazo</p>
                      <input type="date" value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none" />
                    </div>
                    <button onClick={handleCreateGoal} className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]">{editingGoalId ? 'Salvar Alterações' : 'Criar Meta'}</button>
                  </div>
                ) : modalMode === 'contribute_goal' ? (
                  <div className="space-y-8">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valor do Aporte</p>
                      <input 
                        type="number" 
                        value={contributionAmount} 
                        onChange={e => setContributionAmount(e.target.value)} 
                        placeholder="0.00 €" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-black text-[#A3FF47] outline-none text-center" 
                      />
                    </div>
                    <button onClick={handleContributeGoal} className="w-full btn-primary py-5 uppercase font-black tracking-[0.2em]">Confirmar Aporte</button>
                  </div>
                ) : (
                  <div className="py-20 text-center animate-pulse text-zinc-600">Sincronizando...</div>
                )}
              </div>
           </div>
        </div>
      )}

      {isAiLoading && <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center gap-12"><Loader2 className="animate-spin text-[#A3FF47]" size={48} /><p className="font-black text-[#A3FF47] tracking-[0.5em] uppercase text-xs animate-pulse">Neural Syncing...</p></div>}
    </div>
  );
};

export default App;