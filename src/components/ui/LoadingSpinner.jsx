import { motion } from 'framer-motion';

/**
 * Premium glass loading spinner
 * Props: size (sm|md|lg), label
 */
const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
                {/* Outer track */}
                <div className={`${sizeClasses[size]} rounded-full border-slate-200 dark:border-slate-800 opacity-30`} />

                {/* Spinning gradient */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent`}
                />

                {/* Pulsing inner dot */}
                <motion.div
                    animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                />
            </div>

            {label && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
