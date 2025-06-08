
// ABOUTME: System health analytics panel for monitoring server resources and status
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Server, Database, HardDrive, Cpu, MemoryStick, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemHealthData {
  totalDbSize: string;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastBackup: string;
}

interface SystemHealthPanelProps {
  data: SystemHealthData;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ data }) => {
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (usage: number) => {
    if (usage >= 90) return 'text-red-400';
    if (usage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resource Usage */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            Uso de Recursos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">CPU</span>
              </div>
              <span className={`text-lg font-semibold ${getUsageTextColor(data.cpuUsage)}`}>
                {data.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(data.cpuUsage)}`}
                style={{ width: `${data.cpuUsage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Memória</span>
              </div>
              <span className={`text-lg font-semibold ${getUsageTextColor(data.memoryUsage)}`}>
                {data.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(data.memoryUsage)}`}
                style={{ width: `${data.memoryUsage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Disco</span>
              </div>
              <span className={`text-lg font-semibold ${getUsageTextColor(data.diskUsage)}`}>
                {data.diskUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(data.diskUsage)}`}
                style={{ width: `${data.diskUsage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Tamanho total</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.totalDbSize}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Conexões ativas</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.activeConnections}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Último backup</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {formatDistanceToNow(new Date(data.lastBackup), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }} className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${getUsageTextColor(data.cpuUsage)}`}>
                {data.cpuUsage < 70 ? 'Normal' : data.cpuUsage < 90 ? 'Alerta' : 'Crítico'}
              </div>
              <div className="text-gray-400 text-sm">Status da CPU</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${getUsageTextColor(data.memoryUsage)}`}>
                {data.memoryUsage < 70 ? 'Normal' : data.memoryUsage < 90 ? 'Alerta' : 'Crítico'}
              </div>
              <div className="text-gray-400 text-sm">Status da Memória</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${getUsageTextColor(data.diskUsage)}`}>
                {data.diskUsage < 70 ? 'Normal' : data.diskUsage < 90 ? 'Alerta' : 'Crítico'}
              </div>
              <div className="text-gray-400 text-sm">Status do Disco</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
