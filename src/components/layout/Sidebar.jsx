import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, PieChart, Search, Settings,
    Moon, Sun, Plus, TrendingUp, Zap, Users
} from 'lucide-react';
import { useThemeStore, useSubjectStore, useExpenseStore } from '../../store/useStore';
import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { totalAmount, thisMonthExpenses } from '../../utils/analytics';
import AddSubjectModal from '../modals/AddSubjectModal';

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rooms', icon: Users, label: 'Shared Rooms' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
    const { isDark, toggleTheme } = useThemeStore();
    const { subjects } = useSubjectStore();
    const { expenses } = useExpenseStore();
    const [showModal, setShowModal] = useState(false);

    const monthTotal = totalAmount(thisMonthExpenses(expenses));
    const totalSubjects = subjects.length;

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 h-screen glass-card rounded-none border-r border-slate-200/70 dark:border-slate-800/70 sticky top-0 z-30 overflow-hidden">
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 pb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow-blue flex-shrink-0">
                        <Zap size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Finova</span>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Finance Dashboard</p>
                    </div>
                </div>

                {/* Quick Stats Strip */}
                <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-primary-600/10 to-accent-600/10 border border-primary-200/40 dark:border-primary-800/40 rounded-xl">
                    <div className="flex justify-between text-xs">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">This Month</p>
                            <p className="font-bold text-primary-600 dark:text-primary-400 text-base mt-0.5">{formatCurrency(monthTotal)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Subjects</p>
                            <p className="font-bold text-accent-600 dark:text-accent-400 text-base mt-0.5">{totalSubjects}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 py-2">Navigation</p>
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'} />
                                    <span className="text-sm">{label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-indicator"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Subjects list */}
                    {subjects.length > 0 && (
                        <div className="pt-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 py-2">My Subjects</p>
                            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                                {subjects.slice(0, 8).map((s) => (
                                    <NavLink
                                        key={s.id}
                                        to={`/subject/${s.id}`}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-150 ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`
                                        }
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: s.color || '#0284c7' }}
                                        />
                                        <span className="truncate">{s.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Bottom Controls */}
                <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3">
                    {/* Add Subject Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary w-full text-sm py-2.5"
                    >
                        <Plus size={16} />
                        New Subject
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group"
                    >
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-all duration-300 ${isDark ? 'bg-primary-600' : 'bg-slate-300'}`}>
                            <motion.div
                                animate={{ x: isDark ? 16 : 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                            />
                        </div>
                    </button>
                </div>
            </aside>

            <AddSubjectModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
};

export default Sidebar;
