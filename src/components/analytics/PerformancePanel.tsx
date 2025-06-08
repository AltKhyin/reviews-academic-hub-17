
// ABOUTME: Performance analytics panel for monitoring app performance and queries
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, AlertTriangle, Database, Zap, CheckCircle } from 'lucide-react';

interface PerformanceData {
  averageLoadTime: number;
  slowQueries: { query: string; duration: number }[];
  errorRate: number;
  uptimePercentage: number;
  cacheHitRate: number;
  databaseConnections: number;
}

interface PerformancePanelProps {
  data: PerformanceData;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ data }) => {
  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLoadTimeColor = (time: number) => {
    if (time <= 1) return 'text-green-400';
    if (time <= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Metrics */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Tempo médio de carregamento</span>
            </div>
            <span className={`text-lg font-semibold ${getLoadTimeColor(data.averageLoadTime)}`}>
              {data.averageLoadTime.toFixed(1)}s
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-gray-300">Taxa de erro</span>
            </div>
            <span className={`text-lg font-semibold ${getPerformanceColor(100 - data.errorRate, { good: 95, warning: 90 })}`}>
              {data.errorRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Uptime</span>
            </div>
            <span className={`text-lg font-semibold ${getPerformanceColor(data.uptimePercentage, { good: 99, warning: 95 })}`}>
              {data.uptimePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Conexões ativas</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.databaseConnections}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance do Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Taxa de acerto do cache</span>
              <span className={`text-lg font-semibold ${getPerformanceColor(data.cacheHitRate, { good: 80, warning: 60 })}`}>
                {data.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={data.cacheHitRate} 
              className="w-full"
              style={{ backgroundColor: '#444' }}
            />
          </div>
          
          <div className="pt-4 space-y-2">
            <p className="text-sm text-gray-400">Status do Cache:</p>
            <div className="flex items-center space-x-2">
              {data.cacheHitRate >= 80 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Excelente performance</span>
                </>
              ) : data.cacheHitRate >= 60 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Performance aceitável</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">Performance baixa</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slow Queries */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }} className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Queries Lentas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.slowQueries.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400">Nenhuma query lenta detectada</p>
              </div>
            ) : (
              data.slowQueries.map((query, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Query #{index + 1}</span>
                    <span className={`text-sm font-semibold ${
                      query.duration > 200 ? 'text-red-400' :
                      query.duration > 100 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {query.duration}ms
                    </span>
                  </div>
                  <code className="text-xs text-gray-300 font-mono bg-gray-900 p-2 rounded block overflow-x-auto">
                    {query.query}
                  </code>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
