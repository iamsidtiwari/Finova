/**
 * Premium UI Badge
 * Props: children, color (primary|emerald|rose|amber|slate), variant (solid|subtle|outline), size (sm|md)
 */
const Badge = ({
    children,
    color = 'primary',
    variant = 'subtle',
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[11px]',
    };

    const variants = {
        solid: {
            primary: 'bg-primary-600 text-white',
            emerald: 'bg-emerald-600 text-white',
            rose: 'bg-rose-600 text-white',
            amber: 'bg-amber-600 text-white',
            slate: 'bg-slate-600 text-white',
        },
        subtle: {
            primary: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400',
            emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
            rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
            amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
            slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        },
        outline: {
            primary: 'border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400',
            emerald: 'border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
            rose: 'border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400',
            amber: 'border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
            slate: 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400',
        }
    };

    const colorClass = variants[variant][color] || variants.subtle.primary;

    return (
        <span className={`inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-lg transition-colors ${sizeClasses[size]} ${colorClass} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
