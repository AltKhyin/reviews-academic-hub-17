
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SidebarErrorBoundaryProps {
  children: React.ReactNode;
}

interface SidebarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SidebarErrorBoundary extends React.Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SidebarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sidebar Error:', error, errorInfo);
    // Log to Sentry or other error reporting service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { component: 'Sidebar' },
        extra: errorInfo,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Não foi possível carregar a barra lateral</span>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center justify-center space-x-2 mx-auto px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tentar novamente</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
