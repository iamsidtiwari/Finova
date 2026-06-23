import dayjs from 'dayjs';
import { CURRENCY_SYMBOL, MONTHS } from '../constants';

// ─── Currency Formatting ───────────────────────────────────────────────────
export const formatCurrency = (amount, decimals = 0) => {
    const num = Number(amount) || 0;
    if (num >= 100000) {
        return `${CURRENCY_SYMBOL}${(num / 100000).toFixed(1)}L`;
    }
    if (num >= 1000) {
        return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN', { maximumFractionDigits: decimals })}`;
    }
    return `${CURRENCY_SYMBOL}${num.toFixed(decimals)}`;
};

export const formatCurrencyFull = (amount) => {
    const num = Number(amount) || 0;
    return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

// ─── Date Formatting ───────────────────────────────────────────────────────
export const formatDate = (date) => {
    if (!date) return 'Unknown';
    try {
        return dayjs(date).format('D MMM YYYY');
    } catch {
        return 'Invalid date';
    }
};

export const formatDateShort = (date) => {
    if (!date) return '';
    try {
        return dayjs(date).format('D MMM');
    } catch {
        return '';
    }
};

export const formatDateGroup = (date) => {
    if (!date) return 'Unknown';
    try {
        const d = dayjs(date);
        if (d.isToday()) return 'Today';
        if (d.isYesterday()) return 'Yesterday';
        return d.format('MMMM D, YYYY');
    } catch {
        return dayjs(date).format('MMMM D, YYYY');
    }
};

export const formatMonth = (date) => {
    if (!date) return '';
    try {
        return dayjs(date).format('MMM YYYY');
    } catch {
        return '';
    }
};

// ─── Percentage ───────────────────────────────────────────────────────────
export const formatPercent = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
};

export const calcPercent = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((value / total) * 100), 100);
};

// ─── Relative time ────────────────────────────────────────────────────────
export const timeAgo = (date) => {
    if (!date) return '';
    try {
        const diff = dayjs().diff(dayjs(date), 'minute');
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return formatDate(date);
    } catch {
        return '';
    }
};

// ─── Numbers ──────────────────────────────────────────────────────────────
export const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return isNaN(n) ? fallback : n;
};
