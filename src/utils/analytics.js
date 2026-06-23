import dayjs from 'dayjs';
import { CATEGORY_MAP, CHART_COLORS, MONTHS } from '../constants';
import { safeNumber } from './formatters';

// ─── Expense Aggregation Utilities ─────────────────────────────────────────

/**
 * Get total amount from an array of expenses
 */
export const totalAmount = (expenses = []) =>
    expenses.reduce((sum, e) => sum + safeNumber(e.amount), 0);

/**
 * Filter expenses for current month
 */
export const thisMonthExpenses = (expenses = []) => {
    const now = dayjs();
    return expenses.filter(e => {
        const d = dayjs(e.date);
        return d.month() === now.month() && d.year() === now.year();
    });
};

/**
 * Filter expenses for current week (Mon–Sun)
 */
export const thisWeekExpenses = (expenses = []) => {
    const startOfWeek = dayjs().startOf('week');
    const endOfWeek = dayjs().endOf('week');
    return expenses.filter(e => {
        const d = dayjs(e.date);
        return d.isAfter(startOfWeek) && d.isBefore(endOfWeek);
    });
};

/**
 * Filter expenses for today
 */
export const todayExpenses = (expenses = []) => {
    const today = dayjs().format('YYYY-MM-DD');
    return expenses.filter(e => dayjs(e.date).format('YYYY-MM-DD') === today);
};

/**
 * Group expenses by category and return chart-ready data
 */
export const expensesByCategory = (expenses = []) => {
    const grouped = expenses.reduce((acc, e) => {
        const key = e.category || 'other';
        acc[key] = (acc[key] || 0) + safeNumber(e.amount);
        return acc;
    }, {});

    return Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value], i) => ({
            name: CATEGORY_MAP[key]?.label || key,
            value,
            color: CATEGORY_MAP[key]?.color || CHART_COLORS[i % CHART_COLORS.length],
            emoji: CATEGORY_MAP[key]?.emoji || '📦',
        }));
};

/**
 * Group expenses by month (last 6 months)
 */
export const expensesByMonth = (expenses = []) => {
    const result = {};
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const key = dayjs().subtract(i, 'month').format('MMM');
        result[key] = 0;
    }
    expenses.forEach(e => {
        const month = dayjs(e.date).format('MMM');
        if (result[month] !== undefined) {
            result[month] += safeNumber(e.amount);
        }
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
};

/**
 * Group expenses by week day for heatmap
 */
export const expensesByDayOfWeek = (expenses = []) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    expenses.forEach(e => {
        const day = dayjs(e.date).day();
        counts[day] += safeNumber(e.amount);
    });
    return days.map((name, i) => ({ name, value: counts[i] }));
};

/**
 * Group expenses by subject for comparison chart
 */
export const expensesBySubject = (expenses = [], subjects = []) => {
    return subjects.map(s => {
        const spent = expenses
            .filter(e => e.subjectId === s.id)
            .reduce((sum, e) => sum + safeNumber(e.amount), 0);
        return {
            name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
            spent,
            budget: safeNumber(s.budgetLimit),
            remaining: Math.max(safeNumber(s.budgetLimit) - spent, 0),
        };
    }).sort((a, b) => b.spent - a.spent);
};

/**
 * Get the top N categories by spend
 */
export const topCategories = (expenses = [], n = 3) =>
    expensesByCategory(expenses).slice(0, n);

/**
 * Compute daily spending for the last 30 days (line chart)
 */
export const dailySpendingLast30 = (expenses = []) => {
    const result = {};
    for (let i = 29; i >= 0; i--) {
        const key = dayjs().subtract(i, 'day').format('MMM D');
        result[key] = 0;
    }
    expenses.forEach(e => {
        const key = dayjs(e.date).format('MMM D');
        if (result[key] !== undefined) {
            result[key] += safeNumber(e.amount);
        }
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
};

/**
 * Get budget health status
 */
export const budgetHealth = (spent, budget) => {
    if (!budget || budget === 0) return { label: 'No Budget', color: 'slate', pct: 0 };
    const pct = (spent / budget) * 100;
    if (pct >= 100) return { label: 'Over Budget', color: 'rose', pct: 100 };
    if (pct >= 80) return { label: 'Critical', color: 'amber', pct };
    if (pct >= 50) return { label: 'On Track', color: 'primary', pct };
    return { label: 'Healthy', color: 'emerald', pct };
};
