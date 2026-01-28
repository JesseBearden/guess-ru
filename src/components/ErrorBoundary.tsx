import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="flex flex-col items-center justify-center p-8 bg-white/95 rounded-xl shadow-medium text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-5xl mb-4" aria-hidden="true">😔</div>
          <h2 className="text-xl font-bold text-text-dark mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="py-3 px-6 bg-gradient-primary text-white font-semibold rounded-lg transition-all duration-200 min-h-[48px] min-w-[48px] hover:-translate-y-0.5 hover:shadow-pink focus-visible:outline-2 focus-visible:outline-primary-pink focus-visible:outline-offset-2"
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
