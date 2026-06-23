import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useRoomStore } from '../../store/useStore';
import EmptyState from '../../components/ui/EmptyState';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import JoinRoomModal from '../../components/modals/JoinRoomModal';
import { useNavigate } from 'react-router-dom';

const RoomsHome = () => {
    const navigate = useNavigate();
    const { rooms, fetchRooms, loading } = useRoomStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    useState(() => {
        fetchRooms();
    }, [fetchRooms]);

    if (loading && rooms.length === 0) {
        return <div className="p-20 text-center animate-pulse text-slate-400">Loading rooms...</div>;
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={16} className="text-primary-500" />
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Collaborative Rooms</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                        Shared <span className="gradient-text">Expenses</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Track expenses with friends, family, or collorative teams.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsJoinOpen(true)} className="btn-secondary">
                        Join Room
                    </button>
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                        <Plus size={18} />
                        Create Room
                    </button>
                </div>
            </header>

            {rooms.length === 0 ? (
                <EmptyState
                    icon="🏠"
                    title="No Rooms Yet"
                    description="Collaborate with others on group trips, flat expenses, or office projects."
                    action={
                        <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                            <Plus size={16} /> Create Your First Room
                        </button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room, i) => (
                        <RoomCard key={room.id} room={room} index={i} onClick={() => navigate(`/rooms/${room.id}`)} />
                    ))}
                </div>
            )}

            <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
        </div>
    );
};

const RoomCard = ({ room, index, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="glass-card p-6 cursor-pointer group border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-400"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/20">
                    {room.icon || '🚀'}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {room.id}
                </span>
            </div>
            <div className="space-y-1 mb-6">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                    {room.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {room.description || 'No description provided.'}
                </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex -space-x-2">
                    {room.members?.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold uppercase" title={m.full_name}>
                            {(m.full_name || m.name)?.charAt(0)}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1 text-primary-500 font-bold text-sm">
                    Enter <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
};

export default RoomsHome;
