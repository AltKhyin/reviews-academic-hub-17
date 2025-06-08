
// ABOUTME: Error boundary specifically for data loading failures with recovery options
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  context?: string;
}

interface DataErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class DataErrorBoundary extends Component<DataErrorBoundaryProps, DataErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DataErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DataErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring (could integrate with error service)
    this.logError(error, errorInfo);
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context || 'Unknown',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to console for development
    console.group('🚨 Data Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', this.props.context);
    console.groupEnd();

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error monitoring service
      // errorMonitoringService.captureException(errorData);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    const newRetryCount = this.state.retryCount + 1;
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
    });

    // Call parent retry function if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Auto-retry with exponential backoff for non-user-initiated retries
    if (newRetryCount < this.maxRetries) {
      const timeout = setTimeout(() => {
        // This would trigger a re-render and potentially fix transient issues
      }, Math.min(1000 * Math.pow(2, newRetryCount), 10000));
      
      this.retryTimeouts.push(timeout);
    }
  };

  private handleGoHome = () => {
    window.location.href = '/homepage';
  };

  private renderError = () => {
    const { error, retryCount } = this.state;
    const { context } = this.props;
    const canRetry = retryCount < this.maxRetries;
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Oops! Algo deu errado
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                {context ? `Erro ao carregar ${context}` : 'Erro inesperado no carregamento dos dados'}
              </p>
              
              {error && (
                <details className="mt-3 text-xs text-left bg-gray-50 p-3 rounded border">
                  <summary className="cursor-pointer font-medium text-gray-800 mb-2">
                    Detalhes técnicos
                  </summary>
                  <pre className="whitespace-pre-wrap text-gray-600 text-xs">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                  {retryCount > 0 && ` (${retryCount}/${this.maxRetries})`}
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </div>

            {!canRetry && (
              <div className="text-center text-sm text-gray-500">
                Muitas tentativas falharam. Tente recarregar a página.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderError();
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export const withDataErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  context?: string,
  onRetry?: () => void
) => {
  const WrappedComponent = (props: P) => (
    <DataErrorBoundary context={context} onRetry={onRetry}>
      <Component {...props} />
    </DataErrorBoundary>
  );
  
  WrappedComponent.displayName = `withDataErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
