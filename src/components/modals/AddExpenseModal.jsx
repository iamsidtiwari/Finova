import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useExpenseStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';

const AddExpenseModal = ({ isOpen, onClose, subjectId }) => {
    const { addExpense } = useExpenseStore();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            date: dayjs().format('YYYY-MM-DD'),
            paymentMethod: 'upi',
            category: '',
            amount: '',
            note: '',
        }
    });

    const selectedCategory = watch('category');
    const selectedMethod = watch('paymentMethod');
    const amount = watch('amount');

    const onSubmit = (data) => {
        if (!data.category) {
            toast.error('Please select a category');
            return;
        }
        addExpense({
            ...data,
            subjectId,
            amount: Number(data.amount),
            date: dayjs(data.date).toISOString(),
        });
        toast.success(`₹${Number(data.amount).toLocaleString('en-IN')} expense tracked!`);
        reset({ date: dayjs().format('YYYY-MM-DD'), paymentMethod: 'upi', category: '', note: '' });
        onClose();
    };

    const handleClose = () => {
        reset({ date: dayjs().format('YYYY-MM-DD'), paymentMethod: 'upi', category: '', note: '' });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    {/* Modal sheet */}
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Handle (mobile) */}
                        <div className="flex justify-center pt-3 sm:hidden">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                    <DollarSign size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Add Expense</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Track a new spending</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="btn-ghost p-2">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                            {/* Amount */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Amount (₹) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be at least ₹1' } })}
                                        placeholder="0"
                                        className={`glass-input w-full pl-10 text-2xl font-bold py-4 ${errors.amount ? 'border-rose-400' : ''}`}
                                        autoFocus
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
                            </div>

                            {/* Category Grid */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Category *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setValue('category', cat.id)}
                                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all duration-150 ${selectedCategory === cat.id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-800/30'
                                                }`}
                                        >
                                            <span className="text-lg leading-none">{cat.emoji}</span>
                                            <span className={`text-[9px] font-semibold leading-tight ${selectedCategory === cat.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {cat.label.split(' ')[0]}
                                            </span>
                                            {selectedCategory === cat.id && (
                                                <CheckCircle size={10} className="text-primary-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Date</label>
                                    <input
                                        type="date"
                                        {...register('date', { required: true })}
                                        className="glass-input w-full text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Payment</label>
                                    <div className="flex flex-col gap-1">
                                        {PAYMENT_METHODS.slice(0, 3).map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setValue('paymentMethod', method.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${selectedMethod === method.id
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                                                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span>{method.icon}</span>
                                                <span>{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* More payment methods row */}
                            <div className="flex gap-2">
                                {PAYMENT_METHODS.slice(3).map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setValue('paymentMethod', method.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${selectedMethod === method.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <span>{method.icon}</span>
                                        <span>{method.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Note */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Note <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    {...register('note')}
                                    placeholder="What was this for?"
                                    className="glass-input w-full"
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-1">
                                <button type="submit" className="btn-primary w-full py-3.5 text-base">
                                    {amount ? `Track ₹${Number(amount).toLocaleString('en-IN')}` : 'Track Expense'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddExpenseModal;
