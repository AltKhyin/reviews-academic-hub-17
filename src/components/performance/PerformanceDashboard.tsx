
// ABOUTME: Real-time performance monitoring dashboard for development and admin use
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { useIntelligentPrefetch } from '@/hooks/useIntelligentPrefetch';
import { Activity, Cpu, Database, Globe, RefreshCw, TrendingUp } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { 
    metrics, 
    overallScore, 
    optimizationState, 
    triggerOptimization,
    generatePerformanceReport 
  } = usePerformanceOptimizer();
  
  const { behaviorPatterns, prefetchRules, currentConfidence } = useIntelligentPrefetch();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastReport, setLastReport] = useState<any>(null);

  // Generate performance report periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const report = generatePerformanceReport();
      setLastReport(report);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [generatePerformanceReport]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance: <span className={getScoreColor(overallScore)}>{overallScore}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50 space-y-4">
      <Card className="bg-white shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getScoreBadgeVariant(overallScore)}>
                {overallScore}/100
              </Badge>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Core Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="w-3 h-3 mr-1" />
                  Cache
                </span>
                <span className={getScoreColor(metrics.cacheEfficiency)}>
                  {metrics.cacheEfficiency.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cacheEfficiency} className="h-1" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Cpu className="w-3 h-3 mr-1" />
                  Memory
                </span>
                <span className={getScoreColor(Math.max(0, 100 - metrics.memoryUsage))}>
                  {metrics.memoryUsage.toFixed(0)}MB
                </span>
              </div>
              <Progress value={Math.min(100, metrics.memoryUsage)} className="h-1" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  Network
                </span>
                <span className={getScoreColor(Math.max(0, 100 - metrics.networkLatency / 10))}>
                  {metrics.networkLatency.toFixed(0)}ms
                </span>
              </div>
              <Progress value={Math.min(100, 100 - metrics.networkLatency / 20)} className="h-1" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  UX Score
                </span>
                <span className={getScoreColor(metrics.userExperience)}>
                  {metrics.userExperience.toFixed(0)}
                </span>
              </div>
              <Progress value={metrics.userExperience} className="h-1" />
            </div>
          </div>

          {/* Optimization Status */}
          <div className="flex items-center justify-between text-xs">
            <span>Optimizations: {optimizationState.optimizationCount}</span>
            <Button
              onClick={triggerOptimization}
              disabled={optimizationState.isOptimizing}
              size="sm"
              variant="outline"
              className="h-6 text-xs"
            >
              {optimizationState.isOptimizing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Optimize'
              )}
            </Button>
          </div>

          {/* Intelligent Prefetch Status */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Prefetch Rules:</span>
              <span>{prefetchRules.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Patterns Learned:</span>
              <span>{behaviorPatterns.length}</span>
            </div>
            {currentConfidence > 0 && (
              <div className="flex justify-between">
                <span>Next Route Confidence:</span>
                <span>{(currentConfidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Error Rate */}
          {metrics.errorRate > 0 && (
            <div className="text-xs text-red-600">
              Error Rate: {(metrics.errorRate * 100).toFixed(2)}%
            </div>
          )}

          {/* Last Report Summary */}
          {lastReport && lastReport.recommendations.length > 0 && (
            <div className="text-xs">
              <div className="font-medium mb-1">Recommendations:</div>
              <ul className="space-y-1 text-gray-600">
                {lastReport.recommendations.slice(0, 2).map((rec: string, i: number) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
