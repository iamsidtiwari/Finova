import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Users, CheckCircle, Percent, Edit3, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRoomStore } from '../../store/useStore';
import { CATEGORIES, SPLIT_TYPES } from '../../constants';
import toast from 'react-hot-toast';

const AddRoomExpenseModal = ({ isOpen, onClose, room }) => {
    const { addRoomExpense } = useRoomStore();
    const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
    const [splits, setSplits] = useState({}); // { memberId: value }

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            category: 'food',
            note: '',
            date: new Date().toISOString().split('T')[0]
        }
    });

    const amount = watch('amount');
    const selectedCategory = watch('category');

    // Initialize splits when amount or type changes
    useEffect(() => {
        if (!room) return;
        const members = room.members || [];
        if (members.length === 0) return;

        const num = Number(amount) || 0;
        const newSplits = {};

        if (splitType === SPLIT_TYPES.EQUAL) {
            const perPerson = num / members.length;
            members.forEach(m => newSplits[m.userId] = perPerson.toFixed(2));
        } else if (splitType === SPLIT_TYPES.PERCENTAGE) {
            const perPerson = 100 / members.length;
            members.forEach(m => newSplits[m.userId] = perPerson.toFixed(2));
        } else {
            members.forEach(m => newSplits[m.userId] = '0');
        }
        setSplits(newSplits);
    }, [amount, splitType, room]);

    const handleSplitChange = (userId, val) => {
        setSplits(prev => ({ ...prev, [userId]: val }));
    };

    const totalSplit = useMemo(() => {
        return Object.values(splits).reduce((sum, v) => sum + (Number(v) || 0), 0);
    }, [splits]);

    const isBalanced = useMemo(() => {
        const num = Number(amount) || 0;
        const members = room?.members || [];
        if (members.length === 0) return false;

        if (splitType === SPLIT_TYPES.EQUAL) return true;
        if (splitType === SPLIT_TYPES.PERCENTAGE) return Math.abs(totalSplit - 100) < 0.1;
        return Math.abs(totalSplit - num) < 0.1;
    }, [amount, splitType, totalSplit, room]);

    const onSubmit = async (data) => {
        if (!isBalanced) {
            toast.error(splitType === SPLIT_TYPES.PERCENTAGE ? 'Percentages must add up to 100%' : 'Split amounts must match the total.');
            return;
        }

        const finalSplits = room.members.map(m => ({
            userId: m.userId,
            amount: splitType === SPLIT_TYPES.PERCENTAGE ? (Number(amount) * Number(splits[m.userId])) / 100 : Number(splits[m.userId])
        }));

        try {
            await addRoomExpense(room.id, {
                ...data,
                amount: Number(data.amount),
                splits: finalSplits
            });
            toast.success('Shared expense tracked!');
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to track expense');
        }
    };

    if (!room) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                                    <DollarSign size={20} />
                                </div>
                                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Track Room Expense</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                {...register('amount', { required: true })}
                                                placeholder="0.00"
                                                className="glass-input w-full pl-10 text-2xl font-bold py-4"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Category</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {CATEGORIES.slice(0, 10).map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setValue('category', cat.id)}
                                                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCategory === cat.id
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                                                        : 'border-slate-100 dark:border-slate-800'
                                                        }`}
                                                >
                                                    <span className="text-lg">{cat.emoji}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Note</label>
                                        <input {...register('note')} placeholder="What was this for?" className="glass-input w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Split Logic */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                            <Users size={16} /> Split Between
                                        </label>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                            {[
                                                { id: SPLIT_TYPES.EQUAL, icon: <CheckCircle size={14} />, label: '=' },
                                                { id: SPLIT_TYPES.PERCENTAGE, icon: <Percent size={14} />, label: '%' },
                                                { id: SPLIT_TYPES.CUSTOM, icon: <Edit3 size={14} />, label: '₹' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSplitType(type.id)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${splitType === type.id
                                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600'
                                                        : 'text-slate-400'
                                                        }`}
                                                >
                                                    {type.icon} {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        {(room.members || []).map(member => (
                                            <div key={member.userId} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {member.full_name?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-semibold">{member.full_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={splits[member.userId] || ''}
                                                        onChange={(e) => handleSplitChange(member.userId, e.target.value)}
                                                        disabled={splitType === SPLIT_TYPES.EQUAL}
                                                        className="glass-input w-20 py-1 px-2 text-right text-xs font-bold"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-400 w-4">
                                                        {splitType === SPLIT_TYPES.PERCENTAGE ? '%' : '₹'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        <div className={`mt-4 pt-3 border-t text-right flex justify-between items-center ${isBalanced ? 'border-primary-100 dark:border-primary-900/30' : 'border-rose-100'}`}>
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Split:</span>
                                            <span className={`text-sm font-bold ${isBalanced ? 'text-primary-600' : 'text-rose-500'}`}>
                                                {splitType === SPLIT_TYPES.PERCENTAGE ? `${totalSplit.toFixed(1)}%` : `₹${totalSplit.toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-500/20">
                                    <Save size={20} className="mr-2" />
                                    Track Shared Expense
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddRoomExpenseModal;
