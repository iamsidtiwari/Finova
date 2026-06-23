import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore, useAuthStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './pages/Dashboard';
import SubjectDetails from './pages/SubjectDetails';
import Analytics from './pages/Analytics';
import SearchPage from './pages/SearchPage';
import Settings from './pages/Settings';
import RoomsHome from './pages/rooms/RoomsHome';
import RoomDashboard from './pages/rooms/RoomDashboard';
import RoomChat from './pages/rooms/RoomChat';
import RoomAnalytics from './pages/rooms/RoomAnalytics';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ─── Page transition variants ──────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 12, scale: 0.99 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -12, scale: 0.99, transition: { duration: 0.18, ease: 'easeIn' } },
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="w-full"
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── App ───────────────────────────────────────────────────────────────────
function App() {
  const { initTheme } = useThemeStore();
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const location = useLocation();

  // Ensure theme class is applied on mount
  useEffect(() => {
    initTheme();
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [initTheme, isAuthenticated, fetchProfile]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      {!isAuthPage && isAuthenticated && <Sidebar />}

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 overflow-x-hidden ${(!isAuthenticated || isAuthPage) ? 'w-full' : ''}`}>
        {/* Mobile top padding for safe area */}
        <div className={!isAuthPage && isAuthenticated ? "p-4 md:p-8 pb-24 md:pb-8" : ""}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

              <Route path="/" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/subject/:id" element={<ProtectedRoute><PageWrapper><SubjectDetails /></PageWrapper></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><PageWrapper><Analytics /></PageWrapper></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><PageWrapper><SearchPage /></PageWrapper></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />

              {/* Collaborative Rooms Routes */}
              <Route path="/rooms" element={<ProtectedRoute><PageWrapper><RoomsHome /></PageWrapper></ProtectedRoute>} />
              <Route path="/rooms/:roomId" element={<ProtectedRoute><PageWrapper><RoomDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/rooms/:roomId/analytics" element={<ProtectedRoute><PageWrapper><RoomAnalytics /></PageWrapper></ProtectedRoute>} />
              <Route path="/rooms/:roomId/chat" element={<ProtectedRoute><PageWrapper><RoomChat /></PageWrapper></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isAuthPage && isAuthenticated && <MobileNav />}
    </div>
  );
}

export default App;

