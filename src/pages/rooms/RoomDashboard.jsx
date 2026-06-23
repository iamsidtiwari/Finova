import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Activity, DollarSign, TrendingUp,
    ArrowLeft, Plus, MessageSquare, PieChart,
    Settings, Trash2, Edit2, HandCoins, ArrowRightLeft, Loader2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRoomStore } from '../../store/useStore';
import socket from '../../services/socket';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import AddRoomExpenseModal from '../../components/modals/AddRoomExpenseModal';
import SettleUpModal from '../../components/modals/SettleUpModal';
import { CATEGORY_MAP } from '../../constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RoomDashboard = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { currentRoom, fetchRoomDetails, syncExpense, loading } = useRoomStore();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSettleOpen, setIsSettleOpen] = useState(false);

    useEffect(() => {
        fetchRoomDetails(roomId);

        socket.onExpenseAdded((expense) => {
            syncExpense(expense);
        });

        return () => {
            // Clean up socket listeners if needed
        };
    }, [roomId, fetchRoomDetails, syncExpense]);

    const room = currentRoom?.room;
    const members = currentRoom?.members || [];
    const expenses = currentRoom?.expenses || [];
    const settlements = currentRoom?.settlements || [];

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>;
    if (!room) return <div className="p-10 text-center"><EmptyState icon="❓" title="Room not found" /></div>;

    // Use backend-calculated settlements
    const instructions = settlements;


    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/rooms')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">{room.icon || '🚀'}</span>
                            {room.name}
                        </h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">Invite Code: <span className="font-bold text-slate-600 dark:text-slate-300">{room.inviteCode}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/rooms/${roomId}/chat`)} title="Room Chat" className="btn-secondary p-2.5">
                        <MessageSquare size={18} />
                    </button>
                    <button onClick={() => navigate(`/rooms/${roomId}/analytics`)} title="Analytics" className="btn-secondary p-2.5">
                        <PieChart size={18} />
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="btn-primary">
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            </header>

            {/* Room Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Room Spent" value={formatCurrency(expenses.reduce((s, e) => s + Number(e.amount), 0))} icon={<DollarSign size={18} />} color="primary" />
                <StatCard title="Members" value={members.length} icon={<Users size={18} />} color="accent" index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold text-slate-800 dark:text-slate-200">Activity Feed</h2>
                        <button onClick={() => setIsSettleOpen(true)} className="text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
                            <HandCoins size={14} /> Settle Up
                        </button>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="glass-card p-10"><EmptyState icon="💸" title="No activity yet" description="Start tracking group spending to see insights." /></div>
                    ) : (
                        <div className="space-y-4">
                            {expenses
                                .map((item) => (
                                    <ActivityItem
                                        key={item.id}
                                        item={item}
                                        isExpense={true}
                                        onDelete={() => { }} // TODO
                                    />
                                ))
                            }
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Simplified Debts */}
                    <div className="glass-card p-5">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <ArrowRightLeft size={16} className="text-emerald-500" /> Smart Settlements
                        </h3>
                        {instructions.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center italic">Everything is settled! ✨</p>
                        ) : (
                            <div className="space-y-3">
                                {instructions.map((inst, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{inst.fromName}</span>
                                            <span className="text-[10px] text-slate-400">owes {inst.toName}</span>
                                        </div>
                                        <span className="font-bold text-rose-500">{formatCurrency(inst.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Member List */}
                    <div className="glass-card p-5">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <Users size={16} className="text-primary-500" /> Members
                        </h3>
                        <div className="space-y-4">
                            {members.map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shadow-sm">
                                            {m.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{m.full_name}</p>
                                            <p className="text-[10px] text-slate-400 capitalize">{m.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AddRoomExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} room={room} />
            <SettleUpModal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)} room={room} />
        </div>
    );
};

const ActivityItem = ({ item, isExpense, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card flex items-center gap-4 p-4 group"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExpense ? 'bg-primary-50 text-primary-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                {isExpense ? (CATEGORY_MAP[item.category]?.emoji || '💸') : <HandCoins size={20} />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {isExpense ? (item.note || CATEGORY_MAP[item.category]?.label) : `${item.from} paid ${item.to}`}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                    {isExpense ? `Paid by ${item.createdBy}` : 'Debt settled'} • {dayjs(item.createdAt).fromNow()}
                </p>
            </div>

            <div className="text-right">
                <p className={`text-sm font-bold ${isExpense ? 'text-slate-800 dark:text-white' : 'text-emerald-500'}`}>
                    {isExpense ? `- ${formatCurrency(item.amount)}` : `+ ${formatCurrency(item.amount)}`}
                </p>
                {isExpense && (
                    <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity p-1">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default RoomDashboard;
