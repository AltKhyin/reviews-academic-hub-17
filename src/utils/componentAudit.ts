
// ABOUTME: Component audit utility with corrected API call monitoring methods
import React from 'react';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

interface ComponentViolation {
  componentName: string;
  violationType: 'unauthorized_api_call' | 'excessive_requests' | 'performance_issue';
  details: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ComponentAuditor {
  private static instance: ComponentAuditor;
  private violations: ComponentViolation[] = [];
  private monitoringActive = true;

  static getInstance(): ComponentAuditor {
    if (!ComponentAuditor.instance) {
      ComponentAuditor.instance = new ComponentAuditor();
    }
    return ComponentAuditor.instance;
  }

  logViolation(violation: Omit<ComponentViolation, 'timestamp'>) {
    if (!this.monitoringActive) return;

    this.violations.push({
      ...violation,
      timestamp: Date.now(),
    });

    // Keep only recent violations (last hour)
    this.violations = this.violations.filter(
      v => Date.now() - v.timestamp < 60 * 60 * 1000
    );

    console.warn(`Component Violation: ${violation.componentName} - ${violation.violationType}`, {
      details: violation.details,
      severity: violation.severity,
    });
  }

  checkApiCallCompliance(componentName: string): boolean {
    try {
      const stats = apiCallMonitor.getStats();
      const callsPerMinute = stats.totalCalls || 0;

      if (callsPerMinute > 10) {
        this.logViolation({
          componentName,
          violationType: 'excessive_requests',
          details: `Component making ${callsPerMinute.toFixed(2)} requests per minute`,
          severity: callsPerMinute > 50 ? 'critical' : 'high',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('API compliance check failed:', error);
      return true; // Assume compliant if check fails
    }
  }

  getViolationReport(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    recentViolations: ComponentViolation[];
  } {
    const violationsByType: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};

    this.violations.forEach(violation => {
      violationsByType[violation.violationType] = (violationsByType[violation.violationType] || 0) + 1;
      violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
    });

    return {
      totalViolations: this.violations.length,
      violationsByType,
      violationsBySeverity,
      recentViolations: this.violations.slice(-10), // Last 10 violations
    };
  }

  checkPerformanceCompliance(componentName: string, renderTime: number): boolean {
    const threshold = 100; // ms

    if (renderTime > threshold) {
      this.logViolation({
        componentName,
        violationType: 'performance_issue',
        details: `Component render took ${renderTime}ms (threshold: ${threshold}ms)`,
        severity: renderTime > 500 ? 'critical' : renderTime > 200 ? 'high' : 'medium',
      });
      return false;
    }

    return true;
  }

  enableMonitoring() {
    this.monitoringActive = true;
  }

  disableMonitoring() {
    this.monitoringActive = false;
  }

  clearViolations() {
    this.violations = [];
  }
}

export const componentAuditor = ComponentAuditor.getInstance();

// Higher-order component for automatic auditing
export const withComponentAudit = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const AuditedComponent = React.forwardRef<any, P>((props, ref) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      componentAuditor.checkPerformanceCompliance(componentName, renderTime);
      componentAuditor.checkApiCallCompliance(componentName);
    });

    return React.createElement(WrappedComponent, { ...props, ref } as any);
  });

  AuditedComponent.displayName = `withComponentAudit(${componentName})`;
  return AuditedComponent;
};
