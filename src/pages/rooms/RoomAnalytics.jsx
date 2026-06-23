import { useParams, useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, AreaChart, Area
} from 'recharts';
import {
    PieChart as PieIcon, LineChart as LineIcon,
    ArrowLeft, Brain, TrendingUp, Users
} from 'lucide-react';
import { useRoomStore } from '../../store/useStore';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../utils/formatters';

const RoomAnalytics = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { getRoomById, getRoomExpenses } = useRoomStore();

    const room = getRoomById(roomId);
    const expenses = getRoomExpenses(roomId);

    if (!room) return null;

    // Mock data for members spending
    const memberData = room.members.map((m, i) => ({
        name: m.name,
        spent: expenses.filter(e => e.createdBy === m.name).reduce((sum, e) => sum + e.amount, 0) || (i + 1) * 250,
        color: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]
    }));

    // Mock data for categories
    const categoryData = [
        { name: 'Food', value: 450, color: '#f59e0b' },
        { name: 'Travel', value: 1200, color: '#0ea5e9' },
        { name: 'Stay', value: 2500, color: '#8b5cf6' },
        { name: 'Misc', value: 300, color: '#64748b' }
    ];

    return (
        <div className="space-y-8 pb-10">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(`/rooms/${roomId}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <PieIcon size={22} className="text-primary-500" />
                        Room Analytics
                    </h1>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">{room.name} Insights</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card p-6 min-h-[350px]">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <LineIcon size={18} className="text-accent-500" />
                        Member-wise Contribution
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={memberData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => '₹' + v} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                            />
                            <Bar dataKey="spent" radius={[4, 4, 0, 0]} barSize={40}>
                                {memberData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        Category Mix
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Smart Insights */}
            <div className="glass-card p-6 bg-gradient-to-br from-primary-600 to-accent-600 text-white border-none relative overflow-hidden">
                <Sparkles className="absolute top-[-10px] right-[-10px] w-40 h-40 opacity-10" />
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                    <Brain size={22} /> Smart Room Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InsightCard
                        title="Top Spender"
                        value={memberData.sort((a, b) => b.spent - a.spent)[0]?.name || 'N/A'}
                        desc="Contributed 45% of total"
                    />
                    <InsightCard
                        title="Freq. Category"
                        value={categoryData[1].name}
                        desc="Occurred 12 times this month"
                    />
                    <InsightCard
                        title="Room Health"
                        value="Excellent"
                        desc="All debts settled promptly"
                    />
                </div>
            </div>
        </div>
    );
};

const InsightCard = ({ title, value, desc }) => (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{title}</p>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-white/50 font-medium mt-1 uppercase leading-tight">{desc}</p>
    </div>
);

import { Sparkles } from 'lucide-react';

export default RoomAnalytics;
