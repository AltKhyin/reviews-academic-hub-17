
// ABOUTME: Build-time validation utility for architectural compliance
// Prevents architectural violations from being committed to codebase

import { architecturalGuards } from '@/core/ArchitecturalGuards';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    file: string;
    message: string;
    suggestion: string;
  }>;
  warnings: Array<{
    file: string;
    message: string;
  }>;
}

// Build-time validation function
export const validateArchitecturalCompliance = (
  files: Array<{ path: string; content: string }>
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  files.forEach(file => {
    // Validate component imports and patterns
    const buildErrors = architecturalGuards.validateComponentImports(
      file.content, 
      file.path
    );

    buildErrors.forEach(error => {
      result.errors.push({
        file: error.file,
        message: error.message,
        suggestion: error.suggestion
      });
      result.isValid = false;
    });

    // Additional validation rules
    if (isComponentFile(file.path)) {
      // Check for direct useQuery without coordination
      if (hasUncoordinatedQueries(file.content)) {
        result.warnings.push({
          file: file.path,
          message: 'Component uses uncoordinated data fetching patterns'
        });
      }

      // Check for performance anti-patterns
      if (hasPerformanceAntiPatterns(file.content)) {
        result.warnings.push({
          file: file.path,
          message: 'Potential performance anti-patterns detected'
        });
      }
    }
  });

  return result;
};

// Development-time architectural linting
export const lintArchitecturalPatterns = (projectPath: string) => {
  console.log('🔍 Running architectural compliance check...');
  
  // This would integrate with build tools in a real implementation
  // For now, we provide the interface and logging
  
  const violations = architecturalGuards.flagArchitecturalViolations();
  
  if (violations.length > 0) {
    console.group('🚨 ARCHITECTURAL VIOLATIONS DETECTED');
    violations.forEach(violation => {
      console.error(`${violation.severity}: ${violation.message} in ${violation.component}`);
    });
    console.groupEnd();
    
    return false; // Build should fail
  }
  
  console.log('✅ Architectural compliance check passed');
  return true;
};

// Helper functions
function isComponentFile(filePath: string): boolean {
  return filePath.includes('/components/') && 
         !filePath.includes('/core/') && 
         !filePath.includes('/hooks/');
}

function hasUncoordinatedQueries(content: string): boolean {
  return content.includes('useQuery(') && 
         !content.includes('requestCoordinator') &&
         !content.includes('usePageData');
}

function hasPerformanceAntiPatterns(content: string): boolean {
  // Check for common performance anti-patterns
  const antiPatterns = [
    'useEffect.*supabase', // Direct API calls in useEffect
    'useState.*fetch', // Fetching in component state
    'setInterval.*api', // Polling without coordination
  ];
  
  return antiPatterns.some(pattern => 
    new RegExp(pattern, 'i').test(content)
  );
}

// Integration with development tools
export const setupArchitecturalGuards = () => {
  if (process.env.NODE_ENV === 'development') {
    // Initialize runtime enforcement
    architecturalGuards.enforceDataAccessPatterns();
    
    // Set up periodic compliance reporting
    setInterval(() => {
      const report = architecturalGuards.getViolationReport();
      if (report.totalViolations > 0) {
        console.warn('⚠️ Architectural compliance report:', report);
      }
    }, 60000); // Report every minute in development
    
    console.log('🛡️ Architectural guards activated for development');
  }
};
