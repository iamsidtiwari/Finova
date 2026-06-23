import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { useSubjectStore, useExpenseStore } from '../store/useStore';
import { CATEGORY_MAP, CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import EmptyState from '../components/ui/EmptyState';

const SearchPage = () => {
    const navigate = useNavigate();
    const { expenses } = useExpenseStore();
    const { subjects } = useSubjectStore();
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const results = useMemo(() => {
        let list = [...expenses];

        // Search query
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(e =>
                (e.note || '').toLowerCase().includes(q) ||
                (CATEGORY_MAP[e.category]?.label || e.category || '').toLowerCase().includes(q) ||
                String(e.amount).includes(q)
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            list = list.filter(e => e.category === categoryFilter);
        }

        // Subject filter
        if (subjectFilter !== 'all') {
            list = list.filter(e => e.subjectId === subjectFilter);
        }

        // Date range
        if (dateFrom) {
            list = list.filter(e => dayjs(e.date).isAfter(dayjs(dateFrom).subtract(1, 'day')));
        }
        if (dateTo) {
            list = list.filter(e => dayjs(e.date).isBefore(dayjs(dateTo).add(1, 'day')));
        }

        return list.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
    }, [expenses, query, categoryFilter, subjectFilter, dateFrom, dateTo]);

    const totalFound = results.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const hasFilters = categoryFilter !== 'all' || subjectFilter !== 'all' || dateFrom || dateTo;

    const clearFilters = () => {
        setCategoryFilter('all');
        setSubjectFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    Search <span className="gradient-text">Expenses</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {expenses.length} total transactions
                </p>
            </header>

            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by note, category, or amount..."
                        className="glass-input w-full pl-11 pr-10 py-3 text-sm"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(s => !s)}
                    className={`btn-secondary flex-shrink-0 ${hasFilters ? 'border-primary-400 text-primary-600 dark:text-primary-400' : ''}`}
                >
                    <Filter size={16} />
                    Filters
                    {hasFilters && (
                        <span className="ml-1 w-5 h-5 text-xs bg-primary-600 text-white rounded-full flex items-center justify-center">!</span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card overflow-hidden"
                    >
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Advanced Filters</h3>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="text-xs text-primary-500 hover:text-primary-600 font-semibold">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {/* Category */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                                    <select
                                        value={categoryFilter}
                                        onChange={e => setCategoryFilter(e.target.value)}
                                        className="glass-input w-full text-sm py-2"
                                    >
                                        <option value="all">All Categories</option>
                                        {CATEGORIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                                    <select
                                        value={subjectFilter}
                                        onChange={e => setSubjectFilter(e.target.value)}
                                        className="glass-input w-full text-sm py-2"
                                    >
                                        <option value="all">All Subjects</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* From */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        className="glass-input w-full text-sm py-2"
                                    />
                                </div>

                                {/* To */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        className="glass-input w-full text-sm py-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            {(query || hasFilters) && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{results.length}</span> results
                        {query && <> for "<span className="font-semibold">{query}</span>"</>}
                    </span>
                    {results.length > 0 && (
                        <span className="font-bold text-rose-500">Total: -{formatCurrency(totalFound)}</span>
                    )}
                </div>
            )}

            {/* Results List */}
            {!query && !hasFilters ? (
                <EmptyState
                    icon="🔍"
                    title="Search your expenses"
                    description="Type a keyword, category name, or amount to find transactions."
                />
            ) : results.length === 0 ? (
                <EmptyState
                    icon="😕"
                    title="No results found"
                    description="Try different keywords or adjust your filters."
                    action={
                        <button onClick={clearFilters} className="btn-secondary text-sm">
                            Clear Filters
                        </button>
                    }
                />
            ) : (
                <div className="space-y-2">
                    {results.map((expense, i) => {
                        const cat = CATEGORY_MAP[expense.category];
                        const subject = subjects.find(s => s.id === expense.subjectId);
                        return (
                            <motion.div
                                key={expense.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                onClick={() => subject && navigate(`/subject/${subject.id}`)}
                                className={`glass-card p-4 flex items-center gap-3 ${subject ? 'cursor-pointer hover:shadow-card-hover' : ''} transition-all`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                    style={{ backgroundColor: (cat?.color || '#94a3b8') + '22' }}
                                >
                                    {cat?.emoji || '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                                        {cat?.label || expense.category}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {expense.note || 'No note'} · {subject?.name || 'Unknown'} · {expense.paymentMethod?.toUpperCase() || ''}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-rose-500">-{formatCurrency(expense.amount)}</p>
                                    <p className="text-[10px] text-slate-400">{formatDate(expense.date)}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
