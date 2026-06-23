import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                    <div className="glass-card max-w-lg w-full p-8 text-center space-y-6">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="text-rose-500" size={40} />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                                Something went wrong
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Finova encountered an unexpected error. Your data is safe in LocalStorage.
                                You can try refreshing the page.
                            </p>
                        </div>

                        {/* Error details (dev only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-left bg-slate-100 dark:bg-slate-900 rounded-xl p-4 text-xs text-rose-600 dark:text-rose-400 font-mono overflow-auto max-h-40">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <p>{this.state.error.toString()}</p>
                                {this.state.errorInfo && (
                                    <pre className="mt-2 whitespace-pre-wrap text-slate-500 text-xs">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="btn-secondary"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                <RefreshCw size={16} />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
