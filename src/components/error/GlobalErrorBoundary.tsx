
// ABOUTME: Global error boundary for catching and gracefully handling React errors
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('🚨 Global Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Store error info in state
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (placeholder)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // In a real app, you would send this to an error tracking service
    // like Sentry, Bugsnag, or custom logging endpoint
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('📊 Error Report:', errorReport);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/homepage';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
                </p>
                <p className="text-sm text-muted-foreground">
                  ID do erro: <code className="bg-muted px-2 py-1 rounded">{this.state.errorId}</code>
                </p>
              </div>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-4 rounded">
                  <summary className="cursor-pointer font-medium text-sm">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="text-xs mt-1 overflow-auto">{this.state.error.message}</pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="text-xs mt-1 overflow-auto">{this.state.error.stack}</pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Componente:</strong>
                        <pre className="text-xs mt-1 overflow-auto">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button onClick={this.handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
