// ─── Application Constants ─────────────────────────────────────────────────

export const APP_NAME = 'Finova';
export const APP_VERSION = '2.0.0';
export const CURRENCY_SYMBOL = '₹';
export const LOCALSTORAGE_KEYS = {
    SUBJECTS: 'finova-subjects',
    EXPENSES: 'finova-expenses',
    ROOMS: 'finova-rooms',
    THEME: 'finova-theme',
    SETTINGS: 'finova-settings',
};

export const SPLIT_TYPES = {
    EQUAL: 'equal',
    PERCENTAGE: 'percentage',
    CUSTOM: 'custom',
};


// ─── Expense Categories ────────────────────────────────────────────────────
export const CATEGORIES = [
    { id: 'food', label: 'Food & Dining', emoji: '🍽️', color: '#f59e0b' },
    { id: 'transport', label: 'Transport', emoji: '🚗', color: '#0ea5e9' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
    { id: 'health', label: 'Healthcare', emoji: '💊', color: '#10b981' },
    { id: 'education', label: 'Education', emoji: '📚', color: '#8b5cf6' },
    { id: 'bills', label: 'Bills & Utilities', emoji: '⚡', color: '#ef4444' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#06b6d4' },
    { id: 'rent', label: 'Rent', emoji: '🏠', color: '#64748b' },
    { id: 'travel', label: 'Travel', emoji: '✈️', color: '#f97316' },
    { id: 'coffee', label: 'Tea/Coffee', emoji: '☕', color: '#a16207' },
    { id: 'petrol', label: 'Petrol/Fuel', emoji: '⛽', color: '#dc2626' },
    { id: 'xerox', label: 'Xerox/Print', emoji: '🖨️', color: '#7c3aed' },
    { id: 'loan', label: 'Loan Payment', emoji: '💳', color: '#0369a1' },
    { id: 'friend', label: 'Sent to Friend', emoji: '👫', color: '#059669' },
    { id: 'recharge', label: 'Recharge', emoji: '📱', color: '#d97706' },
    { id: 'other', label: 'Other', emoji: '📦', color: '#475569' },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
}, {});

// ─── Payment Methods ───────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI', icon: '📲' },
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'credit', label: 'Credit Card', icon: '💳' },
    { id: 'debit', label: 'Debit Card', icon: '🏦' },
    { id: 'neft', label: 'Bank Transfer', icon: '🏛️' },
];

// ─── Subject Colors ────────────────────────────────────────────────────────
export const SUBJECT_COLORS = [
    '#0284c7', '#7c3aed', '#dc2626', '#059669',
    '#d97706', '#db2777', '#0891b2', '#4f46e5',
    '#65a30d', '#9333ea', '#0369a1', '#be123c',
];

// ─── Chart Colors ──────────────────────────────────────────────────────────
export const CHART_COLORS = [
    '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#06b6d4', '#f97316',
    '#a855f7', '#14b8a6', '#eab308', '#64748b',
];

// ─── Quick Stats Months ────────────────────────────────────────────────────
export const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
