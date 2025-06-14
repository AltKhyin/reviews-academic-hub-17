
// ABOUTME: API access monitoring middleware to prevent unauthorized component database calls
import { supabase } from '@/integrations/supabase/client';

class ApiCallMonitor {
  private static instance: ApiCallMonitor;
  private callLog: Map<string, { count: number; lastCall: number; component?: string }> = new Map();
  private readonly MAX_CALLS_PER_MINUTE = 5;
  private readonly ALERT_THRESHOLD = 10;

  private constructor() {}

  static getInstance(): ApiCallMonitor {
    if (!ApiCallMonitor.instance) {
      ApiCallMonitor.instance = new ApiCallMonitor();
    }
    return ApiCallMonitor.instance;
  }

  logApiCall(endpoint: string, component?: string): void {
    const key = `${endpoint}-${component || 'unknown'}`;
    const now = Date.now();
    const existing = this.callLog.get(key) || { count: 0, lastCall: 0 };
    
    // Reset counter if more than 1 minute has passed
    if (now - existing.lastCall > 60000) {
      existing.count = 0;
    }
    
    existing.count++;
    existing.lastCall = now;
    existing.component = component;
    this.callLog.set(key, existing);

    // Log excessive API calls
    if (existing.count > this.ALERT_THRESHOLD) {
      console.warn(`🚨 API CASCADE DETECTED: ${key} made ${existing.count} calls in last minute`);
    }

    // Development mode detailed logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 API Call: ${endpoint} from ${component || 'unknown'} (${existing.count} calls)`);
    }
  }

  getCallStats(): Record<string, { count: number; lastCall: number; component?: string }> {
    const stats: Record<string, any> = {};
    this.callLog.forEach((value, key) => {
      stats[key] = value;
    });
    return stats;
  }

  getTotalCallsInLastMinute(): number {
    const now = Date.now();
    let total = 0;
    this.callLog.forEach((value) => {
      if (now - value.lastCall <= 60000) {
        total += value.count;
      }
    });
    return total;
  }

  preventUnauthorizedCalls(component: string, endpoint: string): boolean {
    const key = `${endpoint}-${component}`;
    const existing = this.callLog.get(key) || { count: 0, lastCall: 0 };
    
    if (existing.count > this.MAX_CALLS_PER_MINUTE) {
      console.error(`🚫 BLOCKED: ${component} attempted unauthorized API call to ${endpoint}`);
      return false;
    }
    
    return true;
  }
}

// Enhanced Supabase client wrapper with monitoring
class MonitoredSupabaseClient {
  private monitor = ApiCallMonitor.getInstance();
  private client = supabase;

  from(table: string) {
    const component = this.getCallingComponent();
    this.monitor.logApiCall(`table:${table}`, component);
    
    return this.client.from(table as any);
  }

  auth = this.client.auth;
  storage = this.client.storage;
  functions = this.client.functions;
  realtime = this.client.realtime;

  private getCallingComponent(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.tsx') || line.includes('.ts')) {
        const match = line.match(/([A-Z][a-zA-Z0-9]*(?:\.tsx?)?)/);
        if (match) return match[1];
      }
    }
    return 'unknown';
  }
}

export const monitoredSupabase = new MonitoredSupabaseClient();
export const apiCallMonitor = ApiCallMonitor.getInstance();
