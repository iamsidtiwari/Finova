import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CheckCircle, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useExpenseStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';

const EditExpenseModal = ({ isOpen, onClose, expense }) => {
    const { updateExpense } = useExpenseStore();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            date: dayjs().format('YYYY-MM-DD'),
            paymentMethod: 'upi',
            category: '',
            amount: '',
            note: '',
        }
    });

    // Sync form with expense data when it changes or modal opens
    useEffect(() => {
        if (expense && isOpen) {
            reset({
                date: dayjs(expense.date).format('YYYY-MM-DD'),
                paymentMethod: expense.paymentMethod || 'upi',
                category: expense.category || '',
                amount: expense.amount || '',
                note: expense.note || '',
            });
        }
    }, [expense, isOpen, reset]);

    const selectedCategory = watch('category');
    const selectedMethod = watch('paymentMethod');
    const amount = watch('amount');

    const onSubmit = (data) => {
        if (!data.category) {
            toast.error('Please select a category');
            return;
        }
        updateExpense(expense.id, {
            ...data,
            amount: Number(data.amount),
            date: dayjs(data.date).toISOString(),
        });
        toast.success('Expense updated successfully');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && expense && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-center pt-3 sm:hidden">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                                    <Edit2 size={16} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Edit Expense</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Modify transaction details</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="btn-ghost p-2 text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Amount (₹) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        {...register('amount', { required: 'Required', min: 1 })}
                                        className={`glass-input w-full pl-10 text-2xl font-bold py-4 ${errors.amount ? 'border-rose-400' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Category *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setValue('category', cat.id)}
                                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${selectedCategory === cat.id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white/50 dark:bg-slate-800/30'
                                                }`}
                                        >
                                            <span className="text-lg leading-none">{cat.emoji}</span>
                                            <span className="text-[9px] font-semibold leading-tight text-slate-500">
                                                {cat.label.split(' ')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Date</label>
                                    <input type="date" {...register('date', { required: true })} className="glass-input w-full text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Payment</label>
                                    <select {...register('paymentMethod')} className="glass-input w-full text-sm py-2">
                                        {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Note</label>
                                <input {...register('note')} placeholder="What was this for?" className="glass-input w-full" />
                            </div>

                            <button type="submit" className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-500/20">
                                <Save size={18} className="mr-2" />
                                Update Changes
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

import { Edit2 } from 'lucide-react'; // Fix missing import
export default EditExpenseModal;
