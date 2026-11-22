import { Component } from 'react';

/**
 * React Error Boundary — catches unhandled JS errors in child components
 * and shows a friendly fallback UI instead of a white/broken screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; in production you'd send to an error tracker
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            {import.meta.env.DEV
              ? this.state.error?.message
              : 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
