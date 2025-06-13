
// ABOUTME: Phase C validation dashboard for end-to-end performance monitoring and compliance verification
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePhaseC_Validation } from '@/core/PhaseC_PerformanceValidator';
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Database, 
  Cpu, 
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const PhaseC_ValidationDashboard: React.FC = () => {
  const {
    validationResult,
    loading,
    runValidation,
    optimizePerformance,
    verifyCompliance,
    generateReport
  } = usePhaseC_Validation();

  const [autoValidation, setAutoValidation] = useState(true);
  const [complianceStatus, setComplianceStatus] = useState<boolean | null>(null);

  // Run initial validation on mount
  useEffect(() => {
    runValidation();
  }, [runValidation]);

  // Auto-validation every 60 seconds if enabled
  useEffect(() => {
    if (!autoValidation) return;

    const interval = setInterval(() => {
      runValidation();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoValidation, runValidation]);

  // Check compliance status
  useEffect(() => {
    const checkCompliance = async () => {
      const isCompliant = await verifyCompliance();
      setComplianceStatus(isCompliant);
    };

    if (validationResult) {
      checkCompliance();
    }
  }, [validationResult, verifyCompliance]);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

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

  return (
    <div className="fixed top-4 right-4 w-96 z-50 space-y-4">
      <Card className="bg-white shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Phase C Validation
            </CardTitle>
            <div className="flex items-center space-x-2">
              {validationResult && (
                <Badge variant={getScoreBadgeVariant(validationResult.overallScore)}>
                  {validationResult.overallScore}/100
                </Badge>
              )}
              {complianceStatus !== null && (
                <Badge variant={complianceStatus ? 'default' : 'destructive'}>
                  {complianceStatus ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => runValidation()}
                disabled={loading}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
              >
                {loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  'Validate'
                )}
              </Button>
              <Button
                onClick={optimizePerformance}
                disabled={loading}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
              >
                Optimize
              </Button>
            </div>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={autoValidation}
                onChange={(e) => setAutoValidation(e.target.checked)}
                className="w-3 h-3"
              />
              <span>Auto</span>
            </label>
          </div>

          {validationResult && (
            <>
              {/* Request Budget Compliance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <Database className="w-3 h-3 mr-1" />
                    Request Budget
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>{validationResult.requestBudgetCompliance.currentRequests}/{validationResult.requestBudgetCompliance.maxRequests}</span>
                    {validationResult.requestBudgetCompliance.passed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={(validationResult.requestBudgetCompliance.currentRequests / validationResult.requestBudgetCompliance.maxRequests) * 100} 
                  className="h-1" 
                />
              </div>

              {/* Memory Usage Compliance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <Cpu className="w-3 h-3 mr-1" />
                    Memory Usage
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>{validationResult.memoryUsageCompliance.currentUsageMB}MB/{validationResult.memoryUsageCompliance.maxUsageMB}MB</span>
                    {validationResult.memoryUsageCompliance.passed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={(validationResult.memoryUsageCompliance.currentUsageMB / validationResult.memoryUsageCompliance.maxUsageMB) * 100} 
                  className="h-1" 
                />
              </div>

              {/* Architectural Compliance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Architecture
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>
                      {validationResult.architecturalCompliance.coordinatedCalls} coord / {validationResult.architecturalCompliance.directApiCalls} direct
                    </span>
                    {validationResult.architecturalCompliance.passed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Overall Score
                  </span>
                  <span className={`font-bold ${getScoreColor(validationResult.overallScore)}`}>
                    {validationResult.overallScore}/100
                  </span>
                </div>
                <Progress value={validationResult.overallScore} className="h-2 mt-1" />
              </div>

              {/* Recommendations */}
              {validationResult.recommendations.length > 0 && (
                <div className="text-xs">
                  <div className="font-medium mb-1">Recommendations:</div>
                  <ul className="space-y-1 text-gray-600">
                    {validationResult.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Violations */}
              {validationResult.architecturalCompliance.violatingComponents.length > 0 && (
                <div className="text-xs">
                  <div className="font-medium mb-1 text-red-600">Violations:</div>
                  <div className="text-red-500">
                    {validationResult.architecturalCompliance.violatingComponents.slice(0, 3).join(', ')}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Phase C Status */}
          <div className="pt-2 border-t text-xs">
            <div className="flex justify-between">
              <span>Phase C Status:</span>
              <span className={complianceStatus ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                {complianceStatus ? 'COMPLETE' : 'IN PROGRESS'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
