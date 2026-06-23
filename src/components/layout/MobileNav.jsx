import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Search, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/rooms', icon: Users, label: 'Rooms' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-card rounded-none rounded-t-2xl border-t border-slate-200/70 dark:border-slate-800/70 px-2 py-2 flex justify-around items-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-glass">
        {ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="w-full"
            >
                {({ isActive }) => (
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-400 dark:text-slate-500'
                            }`}
                    >
                        <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-indicator"
                                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400"
                                />
                            )}
                        </div>
                        <span className={`text-[10px] font-semibold transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {label}
                        </span>
                    </motion.div>
                )}
            </NavLink>
        ))}
    </nav>
);

export default MobileNav;
