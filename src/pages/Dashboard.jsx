import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, ArrowRight, Wallet, TrendingUp, Calendar, BarChart3,
    TrendingDown, ChevronRight, Sparkles, Loader2
} from 'lucide-react';
import dayjs from 'dayjs';
import { useSubjectStore, useExpenseStore } from '../store/useStore';
import {
    totalAmount, thisMonthExpenses, thisWeekExpenses,
    topCategories, expensesByCategory, budgetHealth
} from '../utils/analytics';
import { formatCurrency, formatDate, calcPercent } from '../utils/formatters';
import { CATEGORY_MAP } from '../constants';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import AddSubjectModal from '../components/modals/AddSubjectModal';

// ─── Dashboard Page ────────────────────────────────────────────────────────
const Dashboard = () => {
    const navigate = useNavigate();
    const { subjects, fetchSubjects, loading: subjectsLoading } = useSubjectStore();
    const { expenses, fetchExpenses, loading: expensesLoading } = useExpenseStore();
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSubjects();
        fetchExpenses();
    }, [fetchSubjects, fetchExpenses]);

    const loading = subjectsLoading || expensesLoading;

    const monthlyExpenses = useMemo(() => thisMonthExpenses(expenses), [expenses]);
    const weeklyExpenses = useMemo(() => thisWeekExpenses(expenses), [expenses]);
    const monthTotal = useMemo(() => totalAmount(monthlyExpenses), [monthlyExpenses]);
    const weekTotal = useMemo(() => totalAmount(weeklyExpenses), [weeklyExpenses]);
    const allTotal = useMemo(() => totalAmount(expenses), [expenses]);
    const topCats = useMemo(() => topCategories(expenses, 4), [expenses]);
    const recentExp = useMemo(() => expenses.slice(0, 5), [expenses]);

    const filteredSubjects = useMemo(() =>
        subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
        [subjects, search]
    );

    // Per-subject spent
    const subjectSpent = useMemo(() => {
        const map = {};
        expenses.forEach(e => {
            if (e.subjectId) map[e.subjectId] = (map[e.subjectId] || 0) + Number(e.amount || 0);
        });
        return map;
    }, [expenses]);

    return (
        <div className="space-y-8">
            {/* ─── Page Header ───────────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-primary-500" />
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Finance Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                        Good {getGreeting()}, <span className="gradient-text">Welcome</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {dayjs().format('dddd, MMMM D YYYY')} • {subjects.length} subjects tracked
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary self-start sm:self-center">
                    <Plus size={18} />
                    New Subject
                </button>
            </header>

            {/* ─── Hero Stats ────────────────────────────────────────── */}
            <div className="gradient-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-700" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Total Spent</p>
                        <p className="text-4xl font-display font-bold text-white">{formatCurrency(allTotal)}</p>
                        <p className="text-white/60 text-xs">{expenses.length} transactions</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">This Month</p>
                        <p className="text-4xl font-display font-bold text-white">{formatCurrency(monthTotal)}</p>
                        <p className="text-white/60 text-xs">{monthlyExpenses.length} transactions</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">This Week</p>
                        <p className="text-4xl font-display font-bold text-white">{formatCurrency(weekTotal)}</p>
                        <p className="text-white/60 text-xs">{weeklyExpenses.length} transactions</p>
                    </div>
                </div>
            </div>

            {/* ─── Stat Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Subjects" value={subjects.length} icon={<Wallet size={18} />} color="primary" index={0} />
                <StatCard title="Total Expenses" value={formatCurrency(allTotal)} icon={<TrendingDown size={18} />} color="rose" index={1} />
                <StatCard title="This Month" value={formatCurrency(monthTotal)} icon={<Calendar size={18} />} color="accent" index={2} />
                <StatCard title="This Week" value={formatCurrency(weekTotal)} icon={<TrendingUp size={18} />} color="emerald" index={3} />
            </div>

            {/* ─── Main Content Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subjects Overview (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search subjects..."
                                className="glass-input w-full pl-4 pr-4 py-2.5 text-sm"
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{filteredSubjects.length} subjects</span>
                    </div>

                    {/* Subjects Grid */}
                    {filteredSubjects.length === 0 ? (
                        <EmptyState
                            icon="💼"
                            title="No subjects yet"
                            description="Create your first subject to start tracking expenses."
                            action={
                                <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
                                    <Plus size={16} /> Create Subject
                                </button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredSubjects.map((subject, i) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    spent={subjectSpent[subject.id] || 0}
                                    index={i}
                                    onClick={() => navigate(`/subject/${subject.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Top Categories */}
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-accent-500" />
                                Top Categories
                            </h3>
                            <button onClick={() => navigate('/analytics')} className="text-xs text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
                                View All <ChevronRight size={12} />
                            </button>
                        </div>
                        {topCats.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No spending data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {topCats.map((cat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                                <span>{cat.emoji}</span> {cat.name}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cat.value)}</span>
                                        </div>
                                        <ProgressBar
                                            value={calcPercent(cat.value, allTotal || 1)}
                                            color="primary"
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingDown size={16} className="text-rose-500" />
                                Recent
                            </h3>
                        </div>
                        {recentExp.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No transactions</p>
                        ) : (
                            <div className="space-y-2">
                                {recentExp.map((exp) => {
                                    const cat = CATEGORY_MAP[exp.category];
                                    const subject = subjects.find(s => s.id === exp.subjectId);
                                    return (
                                        <div key={exp.id} className="flex items-center gap-3 py-1.5">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                                style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}>
                                                {cat?.emoji || '📦'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{cat?.label || exp.category}</p>
                                                <p className="text-xs text-slate-400 truncate">{subject?.name || 'Unknown'} • {formatDate(exp.date)}</p>
                                            </div>
                                            <p className="text-sm font-bold text-rose-500 flex-shrink-0">-{formatCurrency(exp.amount)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAB - Floating Action: Add Subject */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="md:hidden fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center"
                aria-label="Add subject"
            >
                <Plus size={26} />
            </motion.button>

            <AddSubjectModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

// ─── Helper ────────────────────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
}

// ─── Subject Card ──────────────────────────────────────────────────────────
const SubjectCard = ({ subject, spent, index, onClick }) => {
    const health = budgetHealth(spent, subject.budgetLimit);

    const colorClass = {
        primary: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
        rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="glass-card p-5 cursor-pointer group border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-card-hover"
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shadow-sm"
                    style={{ backgroundColor: subject.color || '#0284c7' }}
                >
                    {subject.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                    {health.label !== 'No Budget' && (
                        <span className={`badge text-[10px] ${colorClass[health.color] || colorClass.slate}`}>
                            {health.label}
                        </span>
                    )}
                    <ArrowRight
                        size={16}
                        className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="space-y-1 mb-4">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg leading-tight">{subject.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{subject.description || 'No description'}</p>
            </div>

            {/* Budget progress */}
            {subject.budgetLimit > 0 && (
                <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Budget</span>
                        <span className="text-slate-400">{formatCurrency(spent)} / {formatCurrency(subject.budgetLimit)}</span>
                    </div>
                    <ProgressBar value={health.pct} color={health.color} size="sm" />
                </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Spent</p>
                    <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{formatCurrency(spent)}</p>
                </div>
                {subject.budgetLimit > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Remaining</p>
                        <p className={`text-base font-bold ${health.color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formatCurrency(Math.max(subject.budgetLimit - spent, 0))}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;
