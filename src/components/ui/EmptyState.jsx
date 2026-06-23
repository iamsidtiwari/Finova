import { motion } from 'framer-motion';

/**
 * Premium empty state component
 * Props: icon (emoji/JSX), title, description, action (JSX button)
 */
const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description, action }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4"
    >
        {/* Icon */}
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            {typeof icon === 'string' ? icon : <span className="text-slate-400">{icon}</span>}
        </div>

        {/* Text */}
        <div className="space-y-1.5 max-w-xs">
            <h3 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            )}
        </div>

        {/* Action */}
        {action && <div className="pt-2">{action}</div>}
    </motion.div>
);

export default EmptyState;
