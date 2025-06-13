
// ABOUTME: Phase C monitoring hook for continuous performance tracking and optimization
import { useState, useEffect, useCallback } from 'react';
import { phaseC_PerformanceValidator } from '@/core/PhaseC_PerformanceValidator';

interface PhaseC_MonitoringState {
  isMonitoring: boolean;
  lastValidation: Date | null;
  validationCount: number;
  averageScore: number;
  trends: {
    requestBudget: number[];
    memoryUsage: number[];
    overallScore: number[];
  };
}

export const usePhaseC_Monitoring = () => {
  const [state, setState] = useState<PhaseC_MonitoringState>({
    isMonitoring: false,
    lastValidation: null,
    validationCount: 0,
    averageScore: 0,
    trends: {
      requestBudget: [],
      memoryUsage: [],
      overallScore: []
    }
  });

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: true }));
    
    console.log('🎯 Phase C: Monitoring started');
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: false }));
    
    console.log('⏹️ Phase C: Monitoring stopped');
  }, []);

  // Perform validation and update trends
  const performValidation = useCallback(async () => {
    if (!state.isMonitoring) return;

    try {
      const result = await phaseC_PerformanceValidator.validateCompletePerformance();
      
      setState(prev => {
        const newTrends = {
          requestBudget: [...prev.trends.requestBudget, result.requestBudgetCompliance.currentRequests].slice(-20),
          memoryUsage: [...prev.trends.memoryUsage, result.memoryUsageCompliance.currentUsageMB].slice(-20),
          overallScore: [...prev.trends.overallScore, result.overallScore].slice(-20)
        };

        const newAverageScore = newTrends.overallScore.length > 0 
          ? newTrends.overallScore.reduce((sum, score) => sum + score, 0) / newTrends.overallScore.length
          : 0;

        return {
          ...prev,
          lastValidation: new Date(),
          validationCount: prev.validationCount + 1,
          averageScore: newAverageScore,
          trends: newTrends
        };
      });

      console.log(`✅ Phase C: Validation completed - Score: ${result.overallScore}/100`);
      
    } catch (error) {
      console.error('❌ Phase C: Validation failed:', error);
    }
  }, [state.isMonitoring]);

  // Auto-validation effect
  useEffect(() => {
    if (!state.isMonitoring) return;

    // Initial validation
    performValidation();

    // Set up interval for continuous monitoring
    const interval = setInterval(performValidation, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [state.isMonitoring, performValidation]);

  // Route change monitoring
  useEffect(() => {
    if (!state.isMonitoring) return;

    const handleRouteChange = () => {
      // Perform validation on route change
      setTimeout(performValidation, 1000); // Delay to allow route to settle
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [state.isMonitoring, performValidation]);

  // Generate monitoring report
  const generateMonitoringReport = useCallback(() => {
    const report = phaseC_PerformanceValidator.generatePhaseC_Report();
    
    return {
      ...report,
      monitoring: {
        validationCount: state.validationCount,
        averageScore: state.averageScore,
        isMonitoring: state.isMonitoring,
        lastValidation: state.lastValidation,
        trends: state.trends
      }
    };
  }, [state]);

  // Check if Phase C is complete
  const isPhaseC_Complete = useCallback(() => {
    return state.averageScore >= 90 && state.validationCount >= 5;
  }, [state.averageScore, state.validationCount]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    performValidation,
    generateMonitoringReport,
    isPhaseC_Complete: isPhaseC_Complete()
  };
};
