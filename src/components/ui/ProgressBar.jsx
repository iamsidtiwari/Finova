import { motion } from 'framer-motion';

/**
 * Animated progress bar
 * Props: value (0-100), color (primary|emerald|rose|amber), showLabel, height
 */
const ProgressBar = ({ value = 0, color = 'primary', showLabel = false, size = 'md', className = '' }) => {
    const clampedValue = Math.min(Math.max(Number(value) || 0, 0), 100);

    const colorMap = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
        emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
        rose: 'bg-gradient-to-r from-rose-500 to-rose-400',
        amber: 'bg-gradient-to-r from-amber-500 to-amber-400',
        accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
        slate: 'bg-gradient-to-r from-slate-500 to-slate-400',
    };

    const sizeMap = {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{clampedValue.toFixed(0)}%</span>
                </div>
            )}
            <div className={`${sizeMap[size] || sizeMap.md} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedValue}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full ${colorMap[color] || colorMap.primary}`}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
