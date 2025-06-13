
// ABOUTME: Component-level error boundary for isolated error handling
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';
    console.error(`🚨 Component Error in ${componentName}:`, error, errorInfo);
    
    // Performance monitoring - check if error is memory related
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
      
      if (memoryUsage > 100) {
        console.warn(`💾 High memory usage during error: ${memoryUsage.toFixed(1)}MB in ${componentName}`);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentName = this.props.componentName || 'Component';

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <p className="font-medium">Error in {componentName}</p>
              <p className="text-sm">
                This component encountered an error and couldn't render properly.
              </p>
            </div>
            
            {this.props.showDetails && this.state.error && (
              <details className="text-xs bg-background p-2 rounded">
                <summary className="cursor-pointer">Technical Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
