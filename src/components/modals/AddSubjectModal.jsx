import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSubjectStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import { SUBJECT_COLORS } from '../../constants';

const AddSubjectModal = ({ isOpen, onClose }) => {
    const { addSubject } = useSubjectStore();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: { name: '', description: '', budgetLimit: '', color: SUBJECT_COLORS[0] }
    });

    const selectedColor = watch('color');

    const onSubmit = (data) => {
        addSubject({
            ...data,
            budgetLimit: Number(data.budgetLimit) || 0,
        });
        toast.success(`"${data.name}" created!`);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Create Subject</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organize your expenses by subject</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Subject Name *</label>
                                <input
                                    {...register('name', { required: 'Name is required', minLength: { value: 1, message: 'Name too short' } })}
                                    placeholder="e.g. Personal Budget, College Fees"
                                    className={`glass-input w-full ${errors.name ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                                <textarea
                                    {...register('description')}
                                    placeholder="What does this subject track?"
                                    rows={2}
                                    className="glass-input w-full resize-none"
                                />
                            </div>

                            {/* Budget Limit */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Monthly Budget Limit (₹) <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    {...register('budgetLimit')}
                                    placeholder="0"
                                    className="glass-input w-full"
                                />
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                    <Palette size={14} />
                                    Color Theme
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {SUBJECT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setValue('color', color)}
                                            className="relative w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                                            style={{ backgroundColor: color }}
                                        >
                                            {selectedColor === color && (
                                                <motion.div
                                                    layoutId="color-ring"
                                                    className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-slate-700 dark:ring-slate-200"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button type="submit" className="btn-primary w-full py-3 text-base">
                                    Create Subject
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddSubjectModal;
