import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, Trash2, Edit2, Filter,
    Wallet, TrendingUp, Clock, Search, BarChart2, CheckCircle2
} from 'lucide-react';
import dayjs from 'dayjs';
import { useSubjectStore, useExpenseStore } from '../store/useStore';
import {
    totalAmount, thisMonthExpenses, expensesByCategory
} from '../utils/analytics';
import { formatCurrency, formatDate, calcPercent } from '../utils/formatters';
import { CATEGORY_MAP } from '../constants';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import EditExpenseModal from '../components/modals/EditExpenseModal';
import EmptyState from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import StatCard from '../components/ui/StatCard';
import toast from 'react-hot-toast';

const SubjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { subjects, fetchSubjects } = useSubjectStore();
    const { expenses, fetchExpenses, deleteExpense, loading } = useExpenseStore();
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchQ, setSearchQ] = useState('');
    const [filterCat, setFilterCat] = useState('all');

    useEffect(() => {
        fetchSubjects();
        fetchExpenses({ subjectId: id });
    }, [id, fetchSubjects, fetchExpenses]);

    const subject = useMemo(() => subjects.find(s => s.id === id) ?? null, [subjects, id]);
    const subjectExpenses = useMemo(
        () => expenses.filter(e => e.subjectId === id).sort((a, b) => dayjs(b.date).diff(dayjs(a.date))),
        [expenses, id]
    );

    const monthlyExp = useMemo(() => thisMonthExpenses(subjectExpenses), [subjectExpenses]);
    const totalSpent = useMemo(() => totalAmount(subjectExpenses), [subjectExpenses]);
    const monthSpent = useMemo(() => totalAmount(monthlyExp), [monthlyExp]);
    const catBreakdown = useMemo(() => expensesByCategory(subjectExpenses), [subjectExpenses]);
    const budgetPct = subject?.budgetLimit > 0 ? calcPercent(totalSpent, subject.budgetLimit) : 0;
    const budgetColor = budgetPct >= 100 ? 'rose' : budgetPct >= 80 ? 'amber' : 'emerald';

    // Filtered + searched expenses
    const filteredExp = useMemo(() => {
        let list = subjectExpenses;
        if (filterCat !== 'all') list = list.filter(e => e.category === filterCat);
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            list = list.filter(e =>
                (e.note || '').toLowerCase().includes(q) ||
                (CATEGORY_MAP[e.category]?.label || e.category).toLowerCase().includes(q)
            );
        }
        return list;
    }, [subjectExpenses, filterCat, searchQ]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups = {};
        filteredExp.forEach(e => {
            const key = dayjs(e.date).format('YYYY-MM-DD');
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    }, [filteredExp]);

    // Unique categories in this subject (for filter)
    const availableCategories = useMemo(() => {
        const cats = new Set(subjectExpenses.map(e => e.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [subjectExpenses]);

    const handleDelete = async (expId) => {
        if (window.confirm('Delete this expense?')) {
            try {
                await deleteExpense(expId);
                toast.success('Expense deleted');
            } catch (err) {
                toast.error('Failed to delete expense');
            }
        }
    };

    if (!subject) {
        return (
            <div className="py-20">
                <EmptyState
                    icon="🔍"
                    title="Subject not found"
                    description="This subject doesn't exist or may have been deleted."
                    action={<button onClick={() => navigate('/')} className="btn-primary text-sm"><ArrowLeft size={16} /> Go Back</button>}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ─── Header ──────────────────────────────────────────── */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: subject.color || '#0284c7' }}
                        >
                            {subject.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white truncate">{subject.name}</h1>
                            <p className="text-sm text-slate-400 truncate">{subject.description || 'No description'}</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex-shrink-0">
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Expense</span>
                </button>
            </header>

            {/* ─── Hero Stats Row ───────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 text-white">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, ${subject.color || '#0284c7'}, transparent)` }} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                    <HeroStat label="Total Spent" value={formatCurrency(totalSpent)} sub={`${subjectExpenses.length} txns`} />
                    <HeroStat label="This Month" value={formatCurrency(monthSpent)} sub={`${monthlyExp.length} txns`} />
                    <HeroStat label="Budget" value={subject.budgetLimit > 0 ? formatCurrency(subject.budgetLimit) : 'No limit'} sub="Monthly limit" />
                    <HeroStat
                        label="Budget Used"
                        value={subject.budgetLimit > 0 ? `${budgetPct}%` : '—'}
                        sub={subject.budgetLimit > 0 ? (budgetPct >= 100 ? '⚠️ Over budget' : '✅ Under budget') : 'Set a budget'}
                    />
                </div>
                {subject.budgetLimit > 0 && (
                    <div className="mt-4 relative z-10">
                        <ProgressBar value={budgetPct} color={budgetColor} size="md" />
                    </div>
                )}
            </div>

            {/* ─── Category Breakdown ────────────────────────────────── */}
            {catBreakdown.length > 0 && (
                <div className="glass-card p-5 space-y-4">
                    <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart2 size={16} className="text-accent-500" />
                        Category Breakdown
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {catBreakdown.slice(0, 8).map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setFilterCat(filterCat === getCatId(cat.name) ? 'all' : getCatId(cat.name))}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${filterCat === getCatId(cat.name)
                                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <span className="text-xl">{cat.emoji}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{cat.name}</p>
                                    <p className="text-xs font-bold" style={{ color: cat.color }}>{formatCurrency(cat.value)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Search & Filter Bar ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search expenses..."
                        className="glass-input w-full pl-9 py-2.5 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <Filter size={14} className="text-slate-400 flex-shrink-0" />
                    {availableCategories.slice(0, 5).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterCat === cat
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {cat === 'all' ? '⭐ All' : (CATEGORY_MAP[cat]?.emoji + ' ' + (CATEGORY_MAP[cat]?.label || cat))}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Expense Timeline ──────────────────────────────────── */}
            <div className="space-y-5">
                <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock size={16} className="text-primary-500" />
                    Transaction History
                    <span className="text-xs font-medium text-slate-400 ml-1">({filteredExp.length})</span>
                </h2>

                {groupedByDate.length === 0 ? (
                    <EmptyState
                        icon="💸"
                        title={searchQ || filterCat !== 'all' ? 'No matching expenses' : 'No expenses yet'}
                        description={searchQ || filterCat !== 'all' ? 'Try clearing your search or filter.' : 'Add your first expense to get started.'}
                        action={
                            !searchQ && filterCat === 'all' ? (
                                <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
                                    <Plus size={16} /> Add Expense
                                </button>
                            ) : null
                        }
                    />
                ) : (
                    <div className="space-y-6">
                        {groupedByDate.map(([date, items]) => (
                            <div key={date} className="space-y-2">
                                {/* Date header */}
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {formatDateGroupLabel(date)}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                {/* Expense items */}
                                <div className="space-y-2">
                                    {items.map((item) => {
                                        const cat = CATEGORY_MAP[item.category];
                                        return (
                                            <ExpenseRow
                                                key={item.id}
                                                expense={item}
                                                cat={cat}
                                                onEdit={() => setEditingExpense(item)}
                                                onDelete={() => handleDelete(item.id)}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Day total */}
                                <div className="flex justify-end">
                                    <span className="text-xs font-bold text-slate-400">
                                        Day total: {formatCurrency(totalAmount(items))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="md:hidden fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center"
            >
                <Plus size={26} />
            </motion.button>

            <AddExpenseModal isOpen={showModal} onClose={() => setShowModal(false)} subjectId={id} />
            <EditExpenseModal
                isOpen={!!editingExpense}
                onClose={() => setEditingExpense(null)}
                expense={editingExpense}
            />
        </div>
    );
};

// ─── Sub-components ────────────────────────────────────────────────────────
const HeroStat = ({ label, value, sub }) => (
    <div>
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
    </div>
);

const ExpenseRow = ({ expense, cat, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card flex items-center gap-3 p-3.5 group hover:shadow-card-hover"
    >
        <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}
        >
            {cat?.emoji || '📦'}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cat?.label || expense.category}</p>
            <p className="text-xs text-slate-400 truncate">{expense.note || 'No note'} • {expense.paymentMethod?.toUpperCase() || 'UPI'}</p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-base font-bold text-rose-500 flex-shrink-0">-{formatCurrency(expense.amount)}</p>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg text-slate-300 hover:text-primary-500 transition-all"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-slate-300 hover:text-rose-500 transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    </motion.div>
);

// Helpers
function getCatId(label) {
    const found = Object.entries(CATEGORY_MAP).find(([, v]) => v.label === label);
    return found ? found[0] : label;
}

function formatDateGroupLabel(dateStr) {
    const d = dayjs(dateStr);
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return d.format('ddd, MMM D');
}

export default SubjectDetails;
