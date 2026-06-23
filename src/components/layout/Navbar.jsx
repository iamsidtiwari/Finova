import { NavLink } from 'react-router-dom';
import { Home, PieChart, Search, Settings, Wallet, Calendar } from 'lucide-react';

const Navbar = () => {
    return (
        <>
            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col w-64 h-screen glass-card rounded-none border-r border-slate-200 dark:border-slate-800 p-6 space-y-8 sticky top-0">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/20">
                        F
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Finova</span>
                </div>

                <div className="flex-1 space-y-2">
                    <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
                    <NavItem to="/analytics" icon={<PieChart size={20} />} label="Analytics" />
                    <NavItem to="/search" icon={<Search size={20} />} label="Search" />
                    <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendar" />
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card rounded-none border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                <MobileNavItem to="/" icon={<Home size={24} />} />
                <MobileNavItem to="/analytics" icon={<PieChart size={24} />} />
                <div className="relative -top-8">
                    <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/40 border-4 border-slate-50 dark:border-slate-950">
                        <Wallet size={24} />
                    </div>
                </div>
                <MobileNavItem to="/search" icon={<Search size={24} />} />
                <MobileNavItem to="/settings" icon={<Settings size={24} />} />
            </nav>
        </>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
        }
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </NavLink>
);

const MobileNavItem = ({ to, icon }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `p-2 transition-colors ${isActive ? 'text-primary-500' : 'text-slate-400'}`
        }
    >
        {icon}
    </NavLink>
);

export default Navbar;
