import { motion } from 'framer-motion';

/**
 * Premium animated stat card
 * Props: title, value, subtitle, icon, color (primary|accent|emerald|rose|amber), index
 */
const StatCard = ({ title, value, subtitle, icon, color = 'primary', index = 0, onClick }) => {
    const colorMap = {
        primary: 'from-primary-500 to-primary-600',
        accent: 'from-accent-500 to-accent-600',
        emerald: 'from-emerald-500 to-emerald-600',
        rose: 'from-rose-500 to-rose-600',
        amber: 'from-amber-500 to-amber-600',
        slate: 'from-slate-500 to-slate-600',
    };

    const bgMap = {
        primary: 'bg-primary-50 dark:bg-primary-950/40',
        accent: 'bg-accent-50 dark:bg-accent-950/40',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/40',
        rose: 'bg-rose-50 dark:bg-rose-950/40',
        amber: 'bg-amber-50 dark:bg-amber-950/40',
        slate: 'bg-slate-100 dark:bg-slate-800/60',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={`glass-card p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Icon */}
            <div className={`stat-icon ${bgMap[color] || bgMap.primary}`}>
                <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.primary} w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm`}>
                    {icon}
                </div>
            </div>

            {/* Text */}
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{title}</p>
                <p className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 truncate mt-0.5">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
