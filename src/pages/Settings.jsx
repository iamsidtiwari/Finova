import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download, Upload, FileText, Table, Trash2,
    Moon, Sun, Shield, RefreshCw, Database, Palette, Bell, LogOut, User
} from 'lucide-react';
import { useExpenseStore, useSubjectStore, useThemeStore, useAuthStore } from '../store/useStore';
import { exportService } from '../services/export';
import { formatCurrencyFull } from '../utils/formatters';
import { totalAmount } from '../utils/analytics';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const { expenses, fetchExpenses } = useExpenseStore();
    const { subjects, fetchSubjects } = useSubjectStore();
    const { isDark, toggleTheme } = useThemeStore();
    const { user: profile, logout, updateProfile } = useAuthStore();
    const [editProfile, setEditProfile] = useState(false);
    const [fullName, setFullName] = useState(profile?.fullName || '');

    useEffect(() => {
        fetchSubjects();
        fetchExpenses();
    }, [fetchSubjects, fetchExpenses]);

    useEffect(() => {
        setFullName(profile?.fullName || '');
    }, [profile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({ fullName });
            setEditProfile(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const exportData = expenses.map(e => ({
        Date: e.date ? new Date(e.date).toLocaleDateString('en-IN') : '',
        Category: e.category || '',
        Amount: e.amount || 0,
        'Payment Method': e.paymentMethod || '',
        Note: e.note || '',
        Subject: subjects.find(s => s.id === e.subjectId)?.name || '',
    }));

    const handleBackup = () => {
        const data = storageService.exportBackup();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finova_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup downloaded!');
    };

    const handleRestore = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                const ok = storageService.importBackup(data);
                if (ok) {
                    toast.success('Backup restored! Reloading...');
                    setTimeout(() => window.location.reload(), 1200);
                } else {
                    toast.error('Failed to restore backup.');
                }
            } catch {
                toast.error('Invalid backup file format.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure? This will delete ALL your data permanently. This cannot be undone.')) {
            clearExpenses();
            // Also clear subjects
            subjects.forEach(s => deleteSubject(s.id));
            toast.success('All data cleared.');
        }
    };

    const totalSpent = totalAmount(expenses);

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <header>
                <div className="flex items-center gap-2 mb-1">
                    <Shield size={16} className="text-accent-500" />
                    <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Settings</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    Settings & <span className="gradient-text">Tools</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your preferences, data, and security.</p>
            </header>

            {/* Overview */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center space-y-1">
                    <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{subjects.length}</p>
                    <p className="text-xs text-slate-400 font-medium">Subjects</p>
                </div>
                <div className="glass-card p-4 text-center space-y-1">
                    <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{expenses.length}</p>
                    <p className="text-xs text-slate-400 font-medium">Transactions</p>
                </div>
                <div className="glass-card p-4 text-center space-y-1">
                    <p className="text-2xl font-display font-bold gradient-text">{formatCurrencyFull(totalSpent)}</p>
                    <p className="text-xs text-slate-400 font-medium">Total Tracked</p>
                </div>
            </div>

            {/* Profile Section */}
            <SettingsSection icon={<User size={20} className="text-blue-500" />} title="My Account">
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xl font-bold shadow-sm">
                            {profile?.fullName?.charAt(0)}
                        </div>
                        <div>
                            {editProfile ? (
                                <form onSubmit={handleUpdateProfile} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="glass-input py-1 px-2 text-sm"
                                        autoFocus
                                    />
                                    <button type="submit" className="text-xs font-bold text-blue-500">Save</button>
                                </form>
                            ) : (
                                <>
                                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{profile?.fullName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">@{profile?.username} • {profile?.email}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setEditProfile(!editProfile)} className="text-xs font-bold text-primary-500 hover:underline">
                        {editProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
                <SettingsRow
                    label="Logout"
                    description="Safely sign out of your account"
                    action={
                        <button onClick={handleLogout} className="btn-secondary text-rose-500 hover:bg-rose-50 border-rose-100">
                            <LogOut size={15} />
                            Log Out
                        </button>
                    }
                />
            </SettingsSection>

            {/* Appearance */}
            <SettingsSection icon={<Palette size={20} className="text-amber-500" />} title="Appearance">
                <SettingsRow
                    label="Dark Mode"
                    description="Toggle between light and dark themes"
                    action={
                        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                    }
                />
            </SettingsSection>

            {/* Data Export */}
            <SettingsSection icon={<Download size={20} className="text-primary-500" />} title="Export Data">
                <SettingsRow
                    label="Export to Excel (.xlsx)"
                    description={`${expenses.length} transactions ready for export`}
                    action={
                        <button onClick={() => exportService.toExcel(exportData)} className="btn-secondary text-sm py-2">
                            <Table size={15} className="text-emerald-500" />
                            Export
                        </button>
                    }
                />
                <SettingsRow
                    label="Export to CSV"
                    description="Comma-separated values for spreadsheets"
                    action={
                        <button onClick={() => exportService.toCSV(exportData)} className="btn-secondary text-sm py-2">
                            <FileText size={15} className="text-blue-500" />
                            Export
                        </button>
                    }
                />
                <SettingsRow
                    label="Export to PDF"
                    description="Printable expense report"
                    action={
                        <button onClick={() => exportService.toPDF(exportData)} className="btn-secondary text-sm py-2">
                            <FileText size={15} className="text-rose-500" />
                            Export
                        </button>
                    }
                />
            </SettingsSection>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 pb-4">
                Finova Full-Stack v3.0 • Secure Cloud Synchronization • Advanced Settlement Engine
            </p>
        </div>
    );
};

// ─── Sub-components ────────────────────────────────────────────────────────
const SettingsSection = ({ icon, title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
    >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            {icon}
            <h3 className="font-display font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {children}
        </div>
    </motion.div>
);

const SettingsRow = ({ label, description, action }) => (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{label}</p>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex-shrink-0">{action}</div>
    </div>
);

const ThemeToggle = ({ isDark, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full p-1 flex items-center transition-all duration-300 ${isDark ? 'bg-primary-600' : 'bg-slate-200'}`}
    >
        <motion.div
            animate={{ x: isDark ? 28 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
            {isDark ? <Moon size={10} className="text-primary-600" /> : <Sun size={10} className="text-amber-500" />}
        </motion.div>
    </button>
);

export default Settings;
