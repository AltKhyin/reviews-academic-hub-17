
// ABOUTME: Customizable chart component with multiple chart types and axis configuration
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { EnhancedAnalyticsData } from '@/hooks/useEnhancedAnalytics';

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  xAxis: string;
  yAxis: string;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

interface CustomizableChartProps {
  config: ChartConfig;
  data: EnhancedAnalyticsData;
  animated?: boolean;
  onConfigChange?: (updates: Partial<ChartConfig>) => void;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const CustomizableChart: React.FC<CustomizableChartProps> = ({
  config,
  data,
  animated = true,
  onConfigChange
}) => {
  // Get chart data based on configuration
  const chartData = useMemo(() => {
    switch (config.id) {
      case 'daily-users':
        return data.userEngagement.dailyActiveUsers.map(item => ({
          date: item.date,
          activeUsers: item.count,
          formattedDate: format(new Date(item.date), 'dd/MM')
        }));
      
      case 'page-views':
        return data.userEngagement.topPages.map(item => ({
          page: item.page.replace('/', ''),
          views: item.views,
          uniqueViews: item.uniqueViews,
          bounceRate: item.bounceRate
        }));
      
      case 'user-retention':
        return data.userEngagement.userRetention.map(item => ({
          period: item.period,
          percentage: item.percentage,
          cohortSize: item.cohortSize
        }));
      
      case 'content-engagement':
        return data.contentMetrics.recentPublications.map(item => ({
          date: item.date,
          engagement: item.count * 2.5, // Mock engagement calculation
          publications: item.count,
          featured: item.featuredCount,
          formattedDate: format(new Date(item.date), 'dd/MM')
        }));
      
      default:
        return [];
    }
  }, [config.id, data]);

  // Available axes options based on chart data
  const availableAxes = useMemo(() => {
    if (chartData.length === 0) return { x: [], y: [] };
    
    const firstItem = chartData[0];
    const keys = Object.keys(firstItem);
    
    const xOptions = keys.filter(key => 
      typeof firstItem[key] === 'string' || key.includes('date') || key.includes('period')
    );
    
    const yOptions = keys.filter(key => 
      typeof firstItem[key] === 'number'
    );
    
    return { x: xOptions, y: yOptions };
  }, [chartData]);

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      if (name.includes('percentage') || name.includes('Rate')) {
        return [`${value}%`, name];
      }
      return [value.toLocaleString('pt-BR'), name];
    }
    return [value, name];
  };

  const formatAxisLabel = (value: any, key: string) => {
    if (key.includes('date') || key.includes('Date')) {
      return format(new Date(value), 'dd/MM');
    }
    if (typeof value === 'number' && value > 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const tooltipProps = {
      contentStyle: { 
        backgroundColor: 'hsl(var(--popover))', 
        border: '1px solid hsl(var(--border))', 
        borderRadius: '6px',
        color: 'hsl(var(--popover-foreground))'
      },
      formatter: formatTooltipValue
    };

    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.xAxis)}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.yAxis)}
            />
            <Tooltip {...tooltipProps} />
            <Line 
              type="monotone" 
              dataKey={config.yAxis} 
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
              animationDuration={animated ? 1000 : 0}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.xAxis)}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.yAxis)}
            />
            <Tooltip {...tooltipProps} />
            <Bar 
              dataKey={config.yAxis} 
              fill={CHART_COLORS[1]}
              radius={[4, 4, 0, 0]}
              animationDuration={animated ? 1000 : 0}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.xAxis)}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => formatAxisLabel(value, config.yAxis)}
            />
            <Tooltip {...tooltipProps} />
            <Area 
              type="monotone" 
              dataKey={config.yAxis} 
              stroke={CHART_COLORS[2]}
              fillOpacity={0.3}
              fill={CHART_COLORS[2]}
              animationDuration={animated ? 1000 : 0}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={config.yAxis}
              nameKey={config.xAxis}
              animationDuration={animated ? 1000 : 0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} />
            <Legend />
          </PieChart>
        );

      default:
        return <div className="text-center text-muted-foreground py-8">Tipo de gráfico não suportado</div>;
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum dado disponível para este gráfico
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Axis Configuration */}
      {onConfigChange && (
        <div className="flex gap-4 p-2 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Eixo X:</Label>
            <Select
              value={config.xAxis}
              onValueChange={(xAxis) => onConfigChange({ xAxis })}
            >
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableAxes.x.map((axis) => (
                  <SelectItem key={axis} value={axis}>
                    {axis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs">Eixo Y:</Label>
            <Select
              value={config.yAxis}
              onValueChange={(yAxis) => onConfigChange({ yAxis })}
            >
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableAxes.y.map((axis) => (
                  <SelectItem key={axis} value={axis}>
                    {axis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Chart Rendering */}
      <ResponsiveContainer width="100%" height={config.size === 'small' ? 200 : config.size === 'large' ? 400 : 300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
