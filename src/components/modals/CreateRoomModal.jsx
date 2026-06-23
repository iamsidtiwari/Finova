import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles, Hash, Globe, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRoomStore } from '../../store/useStore';
import toast from 'react-hot-toast';

const CreateRoomModal = ({ isOpen, onClose }) => {
    const { addRoom } = useRoomStore();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            icon: '🚀',
            currency: '₹',
            isPublic: false
        }
    });

    const selectedIcon = watch('icon');
    const icons = ['🚀', '🏠', '🌍', '🏢', '🎓', '👫', '💼', '🏖️', '🍽️', '🎮'];

    const onSubmit = async (data) => {
        try {
            await addRoom(data);
            toast.success(`Room "${data.name}" created successfully!`);
            reset();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create room');
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
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-glow-blue">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Create New Room</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Start collaborating with your team</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {/* Room Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Room Name *</label>
                                <input
                                    {...register('name', { required: 'Room name is required' })}
                                    placeholder="e.g. Goa Trip 2024"
                                    className={`glass-input w-full py-3 text-lg font-bold ${errors.name ? 'border-rose-400' : ''}`}
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                            </div>

                            {/* Icons Selection */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Room Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {icons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setValue('icon', icon)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${selectedIcon === icon
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</label>
                                <textarea
                                    {...register('description')}
                                    placeholder="What is this room for?"
                                    rows={2}
                                    className="glass-input w-full py-3 text-sm resize-none"
                                />
                            </div>

                            {/* Settings Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center block">Currency</label>
                                    <select {...register('currency')} className="glass-input w-full text-sm py-2 px-3 text-center">
                                        <option value="₹">₹ INR</option>
                                        <option value="$">$ USD</option>
                                        <option value="€">€ EUR</option>
                                        <option value="£">£ GBP</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center block">Privacy</label>
                                    <div className="flex items-center gap-2 h-[38px] px-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <Lock size={14} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Private</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">
                                <Sparkles size={20} />
                                Create collaborative Room
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateRoomModal;
