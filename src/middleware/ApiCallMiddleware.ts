
// ABOUTME: API call monitoring middleware for architectural compliance
// Tracks and enforces coordinated data access patterns

interface ApiCallStats {
  endpoint: string;
  count: number;
  lastCalled: number;
  component?: string;
}

interface ApiCallReport {
  totalCalls: number;
  callsByEndpoint: Map<string, ApiCallStats>;
  violationsByComponent: Map<string, number>;
  requestBudgetStatus: {
    current: number;
    maximum: number;
    exceeded: boolean;
  };
}

class ApiCallMonitor {
  private static instance: ApiCallMonitor;
  private callStats = new Map<string, ApiCallStats>();
  private componentViolations = new Map<string, number>();
  private requestBudget = { current: 0, maximum: 10, exceeded: false };
  private readonly STATS_RETENTION_TIME = 60000; // 1 minute

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): ApiCallMonitor {
    if (!ApiCallMonitor.instance) {
      ApiCallMonitor.instance = new ApiCallMonitor();
    }
    return ApiCallMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Clean up old stats periodically
    setInterval(() => {
      this.cleanupOldStats();
    }, 30000); // Every 30 seconds

    console.log('📊 ApiCallMonitor: Monitoring initialized');
  }

  trackApiCall(endpoint: string, component?: string): boolean {
    const now = Date.now();
    const key = component ? `${component}:${endpoint}` : endpoint;
    
    // Update call stats
    const existing = this.callStats.get(key);
    if (existing) {
      existing.count++;
      existing.lastCalled = now;
    } else {
      this.callStats.set(key, {
        endpoint,
        count: 1,
        lastCalled: now,
        component
      });
    }

    // Track component violations
    if (component) {
      const violations = this.componentViolations.get(component) || 0;
      this.componentViolations.set(component, violations + 1);
    }

    // Update request budget
    this.requestBudget.current++;
    this.requestBudget.exceeded = this.requestBudget.current > this.requestBudget.maximum;

    // Log warning if budget exceeded
    if (this.requestBudget.exceeded) {
      console.warn(`🚨 API Budget Exceeded: ${this.requestBudget.current}/${this.requestBudget.maximum}`);
    }

    return !this.requestBudget.exceeded;
  }

  private cleanupOldStats(): void {
    const cutoff = Date.now() - this.STATS_RETENTION_TIME;
    
    for (const [key, stats] of this.callStats.entries()) {
      if (stats.lastCalled < cutoff) {
        this.callStats.delete(key);
      }
    }

    // Reset request budget every minute
    this.requestBudget.current = 0;
    this.requestBudget.exceeded = false;
  }

  getTotalCallsInLastMinute(): number {
    return Array.from(this.callStats.values())
      .reduce((sum, stats) => sum + stats.count, 0);
  }

  getCallStats(): Record<string, { count: number; lastCalled: number }> {
    const result: Record<string, { count: number; lastCalled: number }> = {};
    
    for (const [key, stats] of this.callStats.entries()) {
      result[key] = {
        count: stats.count,
        lastCalled: stats.lastCalled
      };
    }
    
    return result;
  }

  getComponentViolations(): Map<string, number> {
    return new Map(this.componentViolations);
  }

  generateReport(): ApiCallReport {
    return {
      totalCalls: this.getTotalCallsInLastMinute(),
      callsByEndpoint: new Map(this.callStats),
      violationsByComponent: new Map(this.componentViolations),
      requestBudgetStatus: { ...this.requestBudget }
    };
  }

  resetStats(): void {
    this.callStats.clear();
    this.componentViolations.clear();
    this.requestBudget = { current: 0, maximum: 10, exceeded: false };
    console.log('🔄 ApiCallMonitor: Stats reset');
  }
}

export const apiCallMonitor = ApiCallMonitor.getInstance();
export type { ApiCallStats, ApiCallReport };
