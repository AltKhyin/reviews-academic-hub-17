
// ABOUTME: Advanced performance provider that coordinates all enhanced performance systems
import React, { useEffect, useState } from 'react';
import { useAdvancedPerformanceOptimizer } from '@/hooks/useAdvancedPerformanceOptimizer';
import { usePerformanceBudget } from '@/hooks/usePerformanceBudget';
import { useIntelligentCache } from '@/hooks/useIntelligentCache';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { MemoryLeakDetector, QueryOptimizer, ResourceLoadingOptimizer } from '@/utils/performanceHelpers';

interface AdvancedPerformanceProviderProps {
  children: React.ReactNode;
  enableDashboard?: boolean;
  enableAdvancedMonitoring?: boolean;
  enableMemoryLeakDetection?: boolean;
  enableBudgetEnforcement?: boolean;
}

export const AdvancedPerformanceProvider: React.FC<AdvancedPerformanceProviderProps> = ({
  children,
  enableDashboard = process.env.NODE_ENV === 'development',
  enableAdvancedMonitoring = true,
  enableMemoryLeakDetection = true,
  enableBudgetEnforcement = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize all advanced performance systems
  const { 
    metrics, 
    overallScore, 
    optimizationState, 
    triggerOptimization,
    generatePerformanceReport 
  } = useAdvancedPerformanceOptimizer();
  
  const { budgetStatus, checkBudget } = usePerformanceBudget();
  const { getCacheStats, warmCache } = useIntelligentCache();

  // Initialize performance systems
  useEffect(() => {
    const initializePerformance = async () => {
      if (isInitialized) return;
      
      console.log('🚀 Initializing Advanced Performance Optimization System');
      
      try {
        // Initialize memory leak detection
        if (enableMemoryLeakDetection) {
          MemoryLeakDetector.trackEventListeners();
          MemoryLeakDetector.trackTimers();
          console.log('✅ Memory leak detection initialized');
        }

        // Initialize resource optimization
        ResourceLoadingOptimizer.preloadCriticalResources();
        console.log('✅ Resource optimization initialized');
        
        // Perform initial cache warming
        await warmCache('high');
        console.log('✅ Initial cache warming completed');
        
        // Check initial budget compliance
        if (enableBudgetEnforcement) {
          await checkBudget();
          console.log('✅ Performance budget monitoring initialized');
        }
        
        // Trigger initial optimization
        if (enableAdvancedMonitoring) {
          setTimeout(() => {
            triggerOptimization();
          }, 2000); // Wait 2 seconds after initialization
        }
        
        setIsInitialized(true);
        console.log('🎯 Advanced Performance System fully initialized');
        
      } catch (error) {
        console.error('❌ Performance system initialization failed:', error);
      }
    };

    initializePerformance();
  }, [
    isInitialized,
    enableMemoryLeakDetection,
    enableBudgetEnforcement,
    enableAdvancedMonitoring,
    warmCache,
    checkBudget,
    triggerOptimization,
  ]);

  // Performance monitoring and reporting
  useEffect(() => {
    if (!enableAdvancedMonitoring || !isInitialized) return;

    const reportingInterval = setInterval(() => {
      const report = generatePerformanceReport();
      
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Advanced Performance Report');
        console.log('Overall Score:', `${report.overallScore.toFixed(1)}/100`);
        console.log('Performance Metrics:', {
          'Cache Efficiency': `${report.metrics.cacheEfficiency.toFixed(1)}%`,
          'Query Performance': `${report.metrics.queryPerformance.toFixed(1)}/100`,
          'Memory Usage': `${report.metrics.memoryUsage.toFixed(1)}MB`,
          'Memory Leak Risk': `${report.metrics.memoryLeakRisk.toFixed(1)}/100`,
          'Budget Compliance': `${report.metrics.budgetCompliance.toFixed(1)}/100`,
          'Cache Intelligence': `${report.metrics.cacheIntelligence.toFixed(1)}/100`,
        });
        console.log('Optimization State:', {
          'Active Optimizations': optimizationState.activeOptimizations.length,
          'Scheduled Optimizations': optimizationState.scheduledOptimizations.length,
          'Total Optimizations': optimizationState.optimizationCount,
        });
        console.log('Recommendations:', report.recommendations);
        console.groupEnd();
      }
      
      // Alert on critical performance issues
      if (report.overallScore < 50) {
        console.warn('🚨 Critical performance degradation detected');
        triggerOptimization();
      }
      
    }, 60000); // Report every minute

    return () => clearInterval(reportingInterval);
  }, [
    enableAdvancedMonitoring,
    isInitialized,
    generatePerformanceReport,
    optimizationState,
    triggerOptimization,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableMemoryLeakDetection) {
        MemoryLeakDetector.cleanup();
      }
    };
  }, [enableMemoryLeakDetection]);

  // Emergency performance handling
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleCriticalPerformance = () => {
      if (metrics.memoryLeakRisk > 80 || metrics.budgetCompliance < 30) {
        console.warn('🚨 Emergency performance optimization triggered');
        triggerOptimization();
      }
    };

    // Check every 30 seconds for critical issues
    const emergencyInterval = setInterval(handleCriticalPerformance, 30000);
    
    return () => clearInterval(emergencyInterval);
  }, [isInitialized, metrics, triggerOptimization]);

  return (
    <>
      {children}
      {enableDashboard && isInitialized && (
        <PerformanceDashboard />
      )}
    </>
  );
};
