import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    LineChart, Line, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieIcon, Activity, Target, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useSubjectStore, useExpenseStore } from '../store/useStore';
import {
    expensesByCategory, expensesByMonth, expensesBySubject,
    dailySpendingLast30, totalAmount, thisMonthExpenses, topCategories
} from '../utils/analytics';
import { formatCurrency, formatCurrencyFull } from '../utils/formatters';
import { CHART_COLORS } from '../constants';
import EmptyState from '../components/ui/EmptyState';

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-sm">
            {label && <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                    <span className="text-slate-500">{entry.name}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyFull(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Analytics Page ────────────────────────────────────────────────────────
const Analytics = () => {
    const { expenses, fetchExpenses, loading: expLoading } = useExpenseStore();
    const { subjects, fetchSubjects, loading: subLoading } = useSubjectStore();

    useEffect(() => {
        fetchSubjects();
        fetchExpenses();
    }, [fetchSubjects, fetchExpenses]);

    const loading = expLoading || subLoading;

    const categoryData = useMemo(() => expensesByCategory(expenses), [expenses]);
    const monthlyData = useMemo(() => expensesByMonth(expenses), [expenses]);
    const subjectData = useMemo(() => expensesBySubject(expenses, subjects), [expenses, subjects]);
    const dailyData = useMemo(() => dailySpendingLast30(expenses), [expenses]);
    const monthTotal = useMemo(() => totalAmount(thisMonthExpenses(expenses)), [expenses]);
    const allTotal = useMemo(() => totalAmount(expenses), [expenses]);
    const avgMonthly = useMemo(() => {
        const vals = monthlyData.filter(m => m.value > 0);
        return vals.length ? totalAmount(vals.map(v => ({ amount: v.value }))) / vals.length : 0;
    }, [monthlyData]);
    const topCat = categoryData[0];
    const hasData = expenses.length > 0;

    if (loading && !hasData) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="py-20">
                <EmptyState
                    icon="📊"
                    title="No analytics data yet"
                    description="Add some expenses across your subjects and analytics will appear here."
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <header>
                <div className="flex items-center gap-2 mb-1">
                    <Activity size={16} className="text-accent-500" />
                    <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Analytics</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    Financial <span className="gradient-text">Insights</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {expenses.length} total transactions across {subjects.length} subjects
                </p>
            </header>

            {/* Top KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="All Time Total" value={formatCurrency(allTotal)} icon={<DollarSign size={18} />} color="from-primary-600 to-primary-500" index={0} />
                <KpiCard title="Monthly Average" value={formatCurrency(avgMonthly)} icon={<BarChart3 size={18} />} color="from-accent-600 to-accent-500" index={1} />
                <KpiCard title="Top Category" value={topCat?.name || '—'} icon={<PieIcon size={18} />} color="from-emerald-600 to-emerald-500" index={2} />
                <KpiCard title="This Month" value={formatCurrency(monthTotal)} icon={<TrendingUp size={18} />} color="from-rose-600 to-rose-500" index={3} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie / Doughnut Chart - Category Breakdown */}
                <ChartCard title="Category Breakdown" subtitle="Where your money goes" icon="🍕" delay={0}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData.slice(0, 8)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {categoryData.slice(0, 8).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {categoryData.slice(0, 6).map((cat, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || CHART_COLORS[i] }} />
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{cat.emoji} {cat.name}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-auto">{formatCurrency(cat.value)}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Bar Chart - Monthly Trend */}
                <ChartCard title="Monthly Spending" subtitle="Last 6 months" icon="📅" delay={0.1}>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} width={45} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
                                <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]}>
                                    {monthlyData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={i === monthlyData.length - 1 ? '#0ea5e9' : '#cbd5e1'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Line / Area Chart - Daily Spending (30 days) */}
                <ChartCard title="Daily Spending" subtitle="Last 30 days trend" icon="📈" delay={0.2}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData.filter((_, i) => i % 3 === 0)}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" name="Spent" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorGradient)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Horizontal Bar - Subject Comparison */}
                {subjectData.length > 0 && (
                    <ChartCard title="Subject Comparison" subtitle="Spending vs budget" icon="🏆" delay={0.3}>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectData.slice(0, 6)} layout="vertical" barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
                                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="spent" name="Spent" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                                    <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                )}
            </div>

            {/* Statistics Summary */}
            <div className="glass-card p-6 space-y-4">
                <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target size={18} className="text-primary-500" />
                    Advanced Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatItem label="Highest Month" value={formatCurrency(Math.max(...monthlyData.map(m => m.value), 0))} />
                    <StatItem label="Lowest Month" value={formatCurrency(Math.min(...monthlyData.filter(m => m.value > 0).map(m => m.value), 0))} />
                    <StatItem label="Categories Used" value={categoryData.length} />
                    <StatItem label="Avg per Day" value={formatCurrency(allTotal / 30)} />
                    <StatItem label="Total Subject" value={subjects.length} />
                    <StatItem label="Most Spent" value={topCat ? `${topCat.emoji} ${topCat.name}` : '—'} />
                    <StatItem label="This Month %" value={allTotal > 0 ? `${Math.round((monthTotal / allTotal) * 100)}%` : '0%'} />
                    <StatItem label="Transactions" value={expenses.length} />
                </div>
            </div>
        </div>
    );
};

// ─── Helper components ─────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, icon, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-card p-5 space-y-4"
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{icon}</span>{title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
        {children}
    </motion.div>
);

const KpiCard = ({ title, value, icon, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className="glass-card p-4 flex items-center gap-3"
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white flex-shrink-0 shadow-sm`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
            <p className="font-display font-bold text-slate-900 dark:text-white truncate text-sm mt-0.5">{value}</p>
        </div>
    </motion.div>
);

const StatItem = ({ label, value }) => (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="font-display font-bold text-slate-900 dark:text-white text-sm">{value}</p>
    </div>
);

export default Analytics;
