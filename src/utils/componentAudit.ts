// ABOUTME: Component auditing utilities for performance monitoring and code quality
// Tracks component violations and performance issues

interface ComponentViolation {
  componentName: string;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface PerformanceIssue {
  componentName: string;
  issue: string;
  impact: 'minor' | 'moderate' | 'severe';
  recommendation: string;
}

class ComponentAuditor {
  private static violations: ComponentViolation[] = [];
  private static performanceIssues: PerformanceIssue[] = [];
  private static maxViolations = 500; // Prevent memory bloat

  static recordViolation(
    componentName: string, 
    violation: string, 
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const existingViolation = this.violations.find(v => v.componentName === componentName);
    
    if (existingViolation) {
      existingViolation.violations.push(violation);
      existingViolation.timestamp = Date.now();
      if (severity === 'high' || (severity === 'medium' && existingViolation.severity === 'low')) {
        existingViolation.severity = severity;
      }
    } else {
      this.violations.push({
        componentName,
        violations: [violation],
        severity,
        timestamp: Date.now()
      });
    }

    // Manage memory by keeping only recent violations
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxViolations / 2);
    }

    if (process.env.NODE_ENV === 'development' && severity === 'high') {
      console.warn(`🚨 High severity violation in ${componentName}: ${violation}`);
    }
  }

  static recordPerformanceIssue(
    componentName: string,
    issue: string,
    impact: 'minor' | 'moderate' | 'severe',
    recommendation: string
  ): void {
    this.performanceIssues.push({
      componentName,
      issue,
      impact,
      recommendation
    });

    if (process.env.NODE_ENV === 'development' && impact === 'severe') {
      console.error(`💥 Severe performance issue in ${componentName}: ${issue}`);
      console.log(`💡 Recommendation: ${recommendation}`);
    }
  }

  static getViolationReport(): ComponentViolation[] {
    return [...this.violations].sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  static getPerformanceReport(): PerformanceIssue[] {
    return [...this.performanceIssues].sort((a, b) => {
      const impactOrder = { severe: 3, moderate: 2, minor: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  static getComponentHealth(componentName: string): {
    violationCount: number;
    severity: 'low' | 'medium' | 'high' | 'none';
    performanceIssues: number;
    overallHealth: 'good' | 'fair' | 'poor';
  } {
    const violations = this.violations.filter(v => v.componentName === componentName);
    const perfIssues = this.performanceIssues.filter(p => p.componentName === componentName);
    
    const violationCount = violations.reduce((sum, v) => sum + v.violations.length, 0);
    const highestSeverity = violations.reduce((max, v) => {
      const severityOrder = { high: 3, medium: 2, low: 1, none: 0 };
      return severityOrder[v.severity] > severityOrder[max] ? v.severity : max;
    }, 'none' as 'low' | 'medium' | 'high' | 'none');

    const severePerf = perfIssues.filter(p => p.impact === 'severe').length;
    
    let overallHealth: 'good' | 'fair' | 'poor' = 'good';
    if (highestSeverity === 'high' || severePerf > 0 || violationCount > 10) {
      overallHealth = 'poor';
    } else if (highestSeverity === 'medium' || violationCount > 5 || perfIssues.length > 2) {
      overallHealth = 'fair';
    }

    return {
      violationCount,
      severity: highestSeverity,
      performanceIssues: perfIssues.length,
      overallHealth
    };
  }

  static clearViolations(componentName?: string): void {
    if (componentName) {
      this.violations = this.violations.filter(v => v.componentName !== componentName);
      this.performanceIssues = this.performanceIssues.filter(p => p.componentName !== componentName);
    } else {
      this.violations = [];
      this.performanceIssues = [];
    }
  }

  static generateAuditReport(): {
    totalViolations: number;
    highSeverityComponents: string[];
    performanceIssues: number;
    recommendations: string[];
  } {
    const highSeverityComponents = this.violations
      .filter(v => v.severity === 'high')
      .map(v => v.componentName);

    const recommendations = [
      ...new Set(this.performanceIssues.map(p => p.recommendation))
    ];

    return {
      totalViolations: this.violations.reduce((sum, v) => sum + v.violations.length, 0),
      highSeverityComponents: [...new Set(highSeverityComponents)],
      performanceIssues: this.performanceIssues.length,
      recommendations
    };
  }
}

// Utility functions for common auditing scenarios
export const auditUtils = {
  // Check if component is using too many props
  checkPropCount: (componentName: string, propCount: number): void => {
    if (propCount > 10) {
      ComponentAuditor.recordViolation(
        componentName, 
        `High prop count: ${propCount} props (consider using composition or configuration objects)`,
        'medium'
      );
    }
  },

  // Check component file size
  checkComponentSize: (componentName: string, lineCount: number): void => {
    if (lineCount > 300) {
      ComponentAuditor.recordPerformanceIssue(
        componentName,
        `Large component file: ${lineCount} lines`,
        'moderate',
        'Consider breaking down into smaller, focused components'
      );
    }
  },

  // Check for potential memory leaks
  checkMemoryLeaks: (componentName: string, hasCleanup: boolean): void => {
    if (!hasCleanup) {
      ComponentAuditor.recordViolation(
        componentName,
        'Missing cleanup in useEffect or event listeners',
        'high'
      );
    }
  },

  // Check render frequency
  checkRenderFrequency: (componentName: string, renderCount: number, timeWindow: number): void => {
    const rendersPerSecond = renderCount / (timeWindow / 1000);
    if (rendersPerSecond > 10) {
      ComponentAuditor.recordPerformanceIssue(
        componentName,
        `High render frequency: ${rendersPerSecond.toFixed(2)} renders/second`,
        'severe',
        'Consider using React.memo, useMemo, or useCallback to reduce re-renders'
      );
    }
  }
};

export { ComponentAuditor };
export default ComponentAuditor;
