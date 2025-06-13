
// ABOUTME: Global error boundary with performance monitoring and recovery
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class GlobalErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Global Error Boundary caught error:', error, errorInfo);
    
    // Log error details for debugging
    console.group('Error Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.groupEnd();

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Performance impact logging
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory;
      console.warn(`💾 Memory at error: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      console.warn('🚨 Maximum retry attempts reached');
      return;
    }

    console.log(`🔄 Retrying... (Attempt ${retryCount + 1}/3)`);
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });

    // Auto-retry with exponential backoff
    if (retryCount < 2) {
      this.retryTimeout = setTimeout(() => {
        if (this.state.hasError) {
          this.handleRetry();
        }
      }, Math.pow(2, retryCount) * 1000);
    }
  };

  handleGoHome = () => {
    window.location.hash = '/';
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-xs">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                disabled={this.state.retryCount >= 3}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please refresh the page or contact support.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
