import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, ArrowRight, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRoomStore } from '../../store/useStore';
import toast from 'react-hot-toast';

const JoinRoomModal = ({ isOpen, onClose }) => {
    const { joinRoom } = useRoomStore();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            inviteCode: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await joinRoom(data.inviteCode);
            toast.success('Successfully joined the room!');
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired invite code.');
        }
    };

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-glow-amber">
                                    <Hash size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Join Room</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Enter code to collaborate</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">Invite Code *</label>
                                <div className="relative">
                                    <input
                                        {...register('inviteCode', {
                                            required: 'Invite code is required',
                                            pattern: { value: /^FIN-\d{6}$/, message: 'Format: FIN-123456' }
                                        })}
                                        placeholder="FIN-XXXXXX"
                                        className={`glass-input w-full py-4 text-2xl font-mono font-bold tracking-widest text-center uppercase ${errors.inviteCode ? 'border-rose-400' : ''}`}
                                        autoFocus
                                    />
                                    {errors.inviteCode && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center text-xs text-rose-500 mt-2 font-medium"
                                        >
                                            {errors.inviteCode.message}
                                        </motion.p>
                                    )}
                                </div>
                                <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest">Ask the room owner for the code</p>
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 text-base bg-gradient-to-r from-amber-600 to-orange-600 border-none shadow-lg shadow-amber-500/20 hover:shadow-orange-500/40">
                                <Zap size={18} />
                                Join Room Now
                                <ArrowRight size={18} className="ml-auto" />
                            </button>
                        </form>

                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Instant Sync Enabled ⚡
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default JoinRoomModal;
