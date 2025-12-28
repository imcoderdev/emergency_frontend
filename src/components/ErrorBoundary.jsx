import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `ERR-${Date.now().toString(36).toUpperCase()}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (in production, send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to an error reporting service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-400">
                An unexpected error occurred. Don't worry, our team has been notified.
              </p>
            </div>

            {/* Error Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 mb-6">
              {/* Error ID */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                <span className="text-gray-500 text-sm">Error Reference</span>
                <code className="px-3 py-1 bg-gray-900 rounded-lg text-red-400 text-sm font-mono">
                  {errorId}
                </code>
              </div>

              {/* Error Message */}
              {isDev && error && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <Bug size={16} />
                    <span className="text-sm font-medium">Development Details</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 overflow-x-auto">
                    <code className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                      {error.toString()}
                    </code>
                  </div>
                </div>
              )}

              {/* Helpful Tips */}
              <div className="text-gray-400 text-sm space-y-2">
                <p>💡 <strong className="text-gray-300">Tips to resolve this:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Check your internet connection</li>
                  <li>If the problem persists, contact support</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all hover:scale-105"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-all hover:scale-105"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>

            {/* Reload Link */}
            <p className="text-center mt-6 text-gray-500 text-sm">
              Still having issues?{' '}
              <button 
                onClick={this.handleReload}
                className="text-red-400 hover:text-red-300 underline"
              >
                Force reload the page
              </button>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper function for easier use with functional components
 */
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
