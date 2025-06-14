
// ABOUTME: Component audit utility to identify unauthorized API calls
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

interface ComponentAuditResult {
  componentName: string;
  violations: string[];
  apiCallCount: number;
  recommendations: string[];
}

export class ComponentAuditor {
  private static violations: ComponentAuditResult[] = [];

  static auditComponent(componentName: string, hasDirectSupabaseImport: boolean, hasIndividualHooks: boolean): void {
    const violations: string[] = [];
    const recommendations: string[] = [];

    if (hasDirectSupabaseImport) {
      violations.push('Direct Supabase import detected');
      recommendations.push('Use shared context instead of direct Supabase calls');
    }

    if (hasIndividualHooks) {
      violations.push('Individual data fetching hooks detected');
      recommendations.push('Migrate to shared data providers or context');
    }

    const stats = apiCallMonitor.getCallStats();
    const componentCalls = Object.entries(stats)
      .filter(([key]) => key.includes(componentName))
      .reduce((sum, [, value]) => sum + value.count, 0);

    if (componentCalls > 5) {
      violations.push(`Excessive API calls: ${componentCalls} in last minute`);
      recommendations.push('Implement request batching or use shared context');
    }

    if (violations.length > 0) {
      this.violations.push({
        componentName,
        violations,
        apiCallCount: componentCalls,
        recommendations
      });

      console.warn(`🔍 AUDIT: ${componentName}`, {
        violations,
        apiCallCount: componentCalls,
        recommendations
      });
    }
  }

  static getViolationReport(): ComponentAuditResult[] {
    return this.violations;
  }

  static clearViolations(): void {
    this.violations = [];
  }

  static logPerformanceMetrics(): void {
    const totalCalls = apiCallMonitor.getTotalCallsInLastMinute();
    const stats = apiCallMonitor.getCallStats();
    
    console.group('📊 API Performance Metrics');
    console.log(`Total API calls in last minute: ${totalCalls}`);
    console.log('Component breakdown:', stats);
    console.log(`Components with violations: ${this.violations.length}`);
    console.groupEnd();

    if (totalCalls > 10) {
      console.error(`🚨 PERFORMANCE ALERT: ${totalCalls} API calls detected (target: <10)`);
    }
  }
}

// Development mode automatic auditing
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics every 30 seconds
  setInterval(() => {
    ComponentAuditor.logPerformanceMetrics();
  }, 30000);
}
