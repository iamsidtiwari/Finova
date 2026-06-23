import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';

// ─── Auth Store ───────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return true;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    register: async (data) => {
        set({ loading: true });
        try {
            const res = await api.post('/auth/register', data);
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            set({ user: res.data.user, isAuthenticated: true, loading: false });
            return true;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
        window.location.href = '/login';
    },

    fetchProfile: async () => {
        try {
            const res = await api.get('/auth/profile');
            set({ user: res.data });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    },

    updateProfile: async (data) => {
        set({ loading: true });
        try {
            const res = await api.put('/auth/profile', data);
            set({ user: res.data, loading: false });
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    }
}));

// ─── Subject Store ─────────────────────────────────────────────────────────
export const useSubjectStore = create((set, get) => ({
    subjects: [],
    loading: false,

    fetchSubjects: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/finance/subjects');
            set({ subjects: res.data, loading: false });
        } catch (err) {
            set({ loading: false });
        }
    },

    addSubject: async (subject) => {
        try {
            const res = await api.post('/finance/subjects', subject);
            set((state) => ({ subjects: [res.data, ...state.subjects] }));
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    updateSubject: async (id, updates) => {
        try {
            const res = await api.put(`/finance/subjects/${id}`, updates);
            set((state) => ({
                subjects: state.subjects.map((s) => (s.id === id ? res.data : s)),
            }));
        } catch (err) {
            throw err;
        }
    },

    deleteSubject: async (id) => {
        try {
            await api.delete(`/finance/subjects/${id}`);
            set((state) => ({
                subjects: state.subjects.filter((s) => s.id !== id),
            }));
        } catch (err) {
            throw err;
        }
    },

    getSubjectById: (id) => get().subjects.find((s) => s.id === id) ?? null,
}));

// ─── Expense Store ─────────────────────────────────────────────────────────
export const useExpenseStore = create((set, get) => ({
    expenses: [],
    loading: false,

    fetchExpenses: async (filters = {}) => {
        set({ loading: true });
        try {
            const res = await api.get('/finance/expenses', { params: filters });
            set({ expenses: res.data, loading: false });
        } catch (err) {
            set({ loading: false });
        }
    },

    addExpense: async (expense) => {
        try {
            const res = await api.post('/finance/expenses', expense);
            set((state) => ({ expenses: [res.data, ...state.expenses] }));
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    updateExpense: async (id, updates) => {
        try {
            const res = await api.put(`/finance/expenses/${id}`, updates);
            set((state) => ({
                expenses: state.expenses.map((e) => (e.id === id ? res.data : e)),
            }));
        } catch (err) {
            throw err;
        }
    },

    deleteExpense: async (id) => {
        try {
            await api.delete(`/finance/expenses/${id}`);
            set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id),
            }));
        } catch (err) {
            throw err;
        }
    },
}));

// ─── Room Store ────────────────────────────────────────────────────────────
export const useRoomStore = create((set, get) => ({
    rooms: [],
    currentRoom: null,
    loading: false,

    fetchRooms: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/rooms');
            set({ rooms: res.data, loading: false });
        } catch (err) {
            set({ loading: false });
        }
    },

    fetchRoomDetails: async (id) => {
        set({ loading: true });
        try {
            const res = await api.get(`/rooms/${id}`);
            set({ currentRoom: res.data, loading: false });
            socket.joinRoom(id);
        } catch (err) {
            set({ loading: false });
        }
    },

    createRoom: async (roomData) => {
        try {
            const res = await api.post('/rooms', roomData);
            set((state) => ({ rooms: [res.data, ...state.rooms] }));
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    joinRoom: async (inviteCode) => {
        try {
            const res = await api.post('/rooms/join', { inviteCode });
            set((state) => ({ rooms: [res.data.room, ...state.rooms] }));
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    addRoomExpense: async (roomId, expenseData) => {
        try {
            const res = await api.post(`/rooms/${roomId}/expenses`, expenseData);
            socket.emitExpense(roomId, res.data);
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    // Real-time updates handler
    syncExpense: (expense) => {
        set((state) => {
            if (!state.currentRoom || state.currentRoom.room.id !== expense.room_id) return state;
            return {
                currentRoom: {
                    ...state.currentRoom,
                    expenses: [expense, ...state.currentRoom.expenses]
                }
            };
        });
    }
}));

// ─── Theme Store ───────────────────────────────────────────────────────────
export const useThemeStore = create((set, get) => ({
    isDark: localStorage.getItem('theme') === 'dark',

    toggleTheme: () => {
        const next = !get().isDark;
        set({ isDark: next });
        localStorage.setItem('theme', next ? 'dark' : 'light');
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    initTheme: () => {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },
}));


