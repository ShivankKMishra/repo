import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Example: Send to logging service
    // logErrorToService(error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      if (typeof fallback === 'function') {
        return fallback(error!);
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg border border-red-200 shadow-md my-10">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800 mb-2">Error message:</p>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {error?.message || 'Unknown error'}
            </pre>
          </div>
          <div className="mt-4">
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
