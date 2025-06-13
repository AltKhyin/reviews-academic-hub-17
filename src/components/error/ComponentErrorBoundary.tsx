
// ABOUTME: Lightweight error boundary for individual components
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';
    console.error(`🔥 Error in ${componentName}:`, error);
    console.error('Component Stack:', errorInfo.componentStack);

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-red-200 rounded-lg bg-red-50/50">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="font-medium text-red-900 mb-2">
            Erro no componente {this.props.componentName || 'desconhecido'}
          </h3>
          <p className="text-sm text-red-700 text-center mb-4">
            Este componente encontrou um erro e não pôde ser exibido.
          </p>
          <Button onClick={this.handleRetry} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
