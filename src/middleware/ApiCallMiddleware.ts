
// ABOUTME: Request monitoring middleware to prevent unauthorized component API calls
import { supabase } from '@/integrations/supabase/client';

interface ApiCallMetrics {
  componentCalls: number;
  authorizedCalls: number;
  duplicateCalls: Map<string, number>;
  timestamp: number;
}

class ApiCallMonitor {
  private metrics: ApiCallMetrics = {
    componentCalls: 0,
    authorizedCalls: 0,
    duplicateCalls: new Map(),
    timestamp: Date.now()
  };

  private allowedContexts = new Set([
    'UserInteractionContext',
    'AuthContext', 
    'useParallelDataLoader',
    'DataAccessLayer'
  ]);

  trackCall(source: string, operation: string) {
    const callKey = `${source}-${operation}`;
    
    if (this.allowedContexts.has(source)) {
      this.metrics.authorizedCalls++;
    } else {
      this.metrics.componentCalls++;
      console.warn(`🚨 Unauthorized API call from ${source}: ${operation}`);
    }

    // Track duplicates
    const count = this.metrics.duplicateCalls.get(callKey) || 0;
    this.metrics.duplicateCalls.set(callKey, count + 1);
    
    if (count > 0) {
      console.warn(`🔄 Duplicate API call detected: ${callKey} (${count + 1} times)`);
    }
  }

  getMetrics() {
    const totalCalls = this.metrics.componentCalls + this.metrics.authorizedCalls;
    const duplicateCount = Array.from(this.metrics.duplicateCalls.values())
      .filter(count => count > 1).length;
    
    return {
      ...this.metrics,
      totalCalls,
      duplicateCount,
      efficiency: totalCalls > 0 ? (this.metrics.authorizedCalls / totalCalls) * 100 : 100
    };
  }

  reset() {
    this.metrics = {
      componentCalls: 0,
      authorizedCalls: 0,
      duplicateCalls: new Map(),
      timestamp: Date.now()
    };
  }
}

export const apiCallMonitor = new ApiCallMonitor();

// Wrap Supabase client to monitor calls
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  const stackTrace = new Error().stack || '';
  const caller = stackTrace.split('\n')[2] || 'unknown';
  
  // Extract component/context name from stack trace
  let source = 'unknown';
  if (caller.includes('UserInteractionContext')) source = 'UserInteractionContext';
  else if (caller.includes('AuthContext')) source = 'AuthContext';
  else if (caller.includes('useParallelDataLoader')) source = 'useParallelDataLoader';
  else if (caller.includes('ArticleCard')) source = 'ArticleCard';
  else if (caller.includes('Dashboard')) source = 'Dashboard';
  
  apiCallMonitor.trackCall(source, `query-${table}`);
  
  return originalFrom.call(this, table);
};
