import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeStore } from './store/useStore';
import './index.css';

// ─── Theme Initializer ─────────────────────────────────────────────────────
// Read theme from localStorage BEFORE first paint to avoid flash
const initTheme = () => {
  try {
    const raw = localStorage.getItem('finova-theme');
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.isDark) document.documentElement.classList.add('dark');
    }
  } catch {
    // ignore
  }
};
initTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
              style: { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
              style: { background: '#fff1f2', color: '#881337', border: '1px solid #fecdd3' },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
