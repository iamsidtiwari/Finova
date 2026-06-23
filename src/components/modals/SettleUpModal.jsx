import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, ArrowRight, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRoomStore, useAuthStore } from '../../store/useStore';
import toast from 'react-hot-toast';

const SettleUpModal = ({ isOpen, onClose, room }) => {
    const { addSettlement } = useRoomStore();
    const { user: profile } = useAuthStore();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            from: profile.name,
            to: '',
            amount: '',
            note: 'Settled up! ✨'
        }
    });

    const selectedTo = watch('to');

    const onSubmit = async (data) => {
        try {
            await addSettlement(room.id, {
                toUserId: data.to,
                amount: Number(data.amount)
            });
            toast.success(`Settlement recorded!`);
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record settlement');
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
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-glow-emerald">
                                    <HandCoins size={20} />
                                </div>
                                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Settle Up</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="flex items-center justify-between gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 capitalize mb-1">From</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-white">{profile.fullName}</p>
                                </div>
                                <ArrowRight className="text-slate-300" size={16} />
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 capitalize mb-1">To</p>
                                    <select
                                        {...register('to', { required: 'Please select a member' })}
                                        className="bg-transparent text-sm font-bold text-primary-600 outline-none cursor-pointer text-center w-full"
                                    >
                                        <option value="">Select...</option>
                                        {(room.members || []).filter(m => m.userId !== profile.id).map(m => (
                                            <option key={m.id} value={m.userId}>{m.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Settlement Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('amount', { required: 'Amount is required', min: 0.01 })}
                                        placeholder="0.00"
                                        className="glass-input w-full pl-8 py-3 text-xl font-bold"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 text-base bg-gradient-to-r from-emerald-600 to-teal-600 border-none shadow-lg shadow-emerald-500/20">
                                <Save size={18} className="mr-2" />
                                Record Settlement
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettleUpModal;
