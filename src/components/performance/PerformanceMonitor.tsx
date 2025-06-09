
// ABOUTME: Development performance monitoring dashboard for optimization validation
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRPCPerformanceMonitoring } from '@/hooks/useRPCPerformanceMonitoring';
import { useMaterializedViewsOptimization } from '@/hooks/useMaterializedViewsOptimization';
import { Activity, Database, Zap, Clock } from 'lucide-react';

export const PerformanceMonitor: React.FC = () => {
  const { 
    rpcMetrics, 
    generatePerformanceReport, 
    performanceComparisons, 
    queryPerformanceData 
  } = useRPCPerformanceMonitoring();
  
  const { viewHealth } = useMaterializedViewsOptimization();

  const report = generatePerformanceReport();

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-50">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* RPC Metrics */}
          <div>
            <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              RPC Functions
            </h4>
            <div className="space-y-1">
              {rpcMetrics.slice(0, 3).map((metric) => (
                <div key={metric.functionName} className="flex justify-between text-xs">
                  <span className="truncate">{metric.functionName}</span>
                  <Badge variant={metric.averageExecutionTime > 1000 ? 'destructive' : 'secondary'}>
                    {metric.averageExecutionTime.toFixed(0)}ms
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Materialized Views */}
          <div>
            <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Materialized Views
            </h4>
            <div className="space-y-1">
              {viewHealth.slice(0, 2).map((view) => (
                <div key={view.view_name} className="flex justify-between text-xs">
                  <span className="truncate">{view.view_name.replace('mv_', '')}</span>
                  <Badge variant={view.is_stale ? 'destructive' : 'secondary'}>
                    {view.is_stale ? 'Stale' : 'Fresh'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Comparisons */}
          {performanceComparisons.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent Comparisons
              </h4>
              <div className="space-y-1">
                {performanceComparisons.slice(-2).map((comparison, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>RPC vs Legacy</span>
                    <Badge variant={comparison.improvementPercentage > 0 ? 'secondary' : 'destructive'}>
                      {comparison.improvementPercentage > 0 ? '+' : ''}{comparison.improvementPercentage.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Database Stats */}
          {queryPerformanceData && (
            <div>
              <h4 className="text-xs font-medium mb-1">Database</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Cache Hit Ratio</span>
                  <Badge variant="secondary">
                    {queryPerformanceData.cache_hit_ratio || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Connections</span>
                  <span>{queryPerformanceData.active_connections || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1 text-yellow-600">Recommendations</h4>
              <div className="text-xs text-yellow-600">
                {report.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="truncate">{rec}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
