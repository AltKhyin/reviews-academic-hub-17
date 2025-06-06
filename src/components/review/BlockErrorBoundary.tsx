
// ABOUTME: Error boundary for review blocks to handle graceful degradation
// Provides fallback UI when block rendering fails

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  blockId?: string | number;
  blockType?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class BlockErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Block rendering error:', {
      blockId: this.props.blockId,
      blockType: this.props.blockType,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card 
          className="p-6 border-red-500/50 bg-red-500/10 my-4"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.5)',
            color: '#ffffff'
          }}
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                Erro ao renderizar bloco
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-red-200">
                  Não foi possível exibir este bloco de conteúdo.
                </p>
                {this.props.blockType && (
                  <p className="text-red-200/80">
                    Tipo: <code className="bg-red-500/20 px-2 py-1 rounded">{this.props.blockType}</code>
                  </p>
                )}
                {this.props.blockId && (
                  <p className="text-red-200/80">
                    ID: <code className="bg-red-500/20 px-2 py-1 rounded">{this.props.blockId}</code>
                  </p>
                )}
                {this.state.error && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-red-300 hover:text-red-200">
                      Detalhes do erro
                    </summary>
                    <div className="mt-2 p-3 bg-red-500/20 rounded text-xs font-mono">
                      <p className="text-red-200">{this.state.error.message}</p>
                      {this.state.error.stack && (
                        <pre className="mt-2 text-red-300/70 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleRetry}
                  className="border-red-400 text-red-300 hover:bg-red-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
