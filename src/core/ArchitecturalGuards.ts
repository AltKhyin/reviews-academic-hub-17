
// ABOUTME: Architectural enforcement mechanisms to prevent direct API access violations
// Provides build-time and runtime validation of component data access patterns

interface ArchitecturalViolation {
  type: 'DIRECT_IMPORT' | 'UNAUTHORIZED_API_CALL' | 'BYPASS_CONTEXT';
  component: string;
  file: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

interface BuildError {
  file: string;
  line?: number;
  message: string;
  suggestion: string;
}

class ArchitecturalGuards {
  private static instance: ArchitecturalGuards;
  private violations: ArchitecturalViolation[] = [];
  private blockedCalls = new Set<string>();

  private constructor() {}

  static getInstance(): ArchitecturalGuards {
    if (!ArchitecturalGuards.instance) {
      ArchitecturalGuards.instance = new ArchitecturalGuards();
    }
    return ArchitecturalGuards.instance;
  }

  // Build-time validation for preventing direct Supabase imports
  validateComponentImports(componentCode: string, fileName: string): BuildError[] {
    const errors: BuildError[] = [];
    const lines = componentCode.split('\n');

    lines.forEach((line, index) => {
      // Check for direct Supabase imports in components (not in core/hooks)
      if (this.isComponentFile(fileName) && this.hasDirectSupabaseImport(line)) {
        errors.push({
          file: fileName,
          line: index + 1,
          message: 'Direct Supabase import detected in component',
          suggestion: 'Use standardized data access hooks instead (usePageData, useUserContext)'
        });
      }

      // Check for direct API calls in components
      if (this.isComponentFile(fileName) && this.hasDirectApiCall(line)) {
        errors.push({
          file: fileName,
          line: index + 1,
          message: 'Direct API call detected in component',
          suggestion: 'Use coordinated data loading through RequestCoordinator'
        });
      }

      // Check for useQuery without coordination
      if (this.isComponentFile(fileName) && this.hasUncoordinatedQuery(line)) {
        errors.push({
          file: fileName,
          line: index + 1,
          message: 'Uncoordinated useQuery detected',
          suggestion: 'Use standardized data access patterns for coordinated loading'
        });
      }
    });

    return errors;
  }

  // Runtime enforcement - intercept unauthorized API calls
  interceptUnauthorizedRequests(): void {
    // Monitor global network requests and flag violations
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const url = args[0]?.toString() || '';
        
        if (this.isSupabaseApiCall(url) && !this.isAuthorizedCaller()) {
          const violation: ArchitecturalViolation = {
            type: 'UNAUTHORIZED_API_CALL',
            component: this.getCallingComponent(),
            file: 'unknown',
            severity: 'ERROR',
            message: `Unauthorized Supabase API call: ${url}`
          };
          
          this.flagViolation(violation);
          console.error('🚫 ArchitecturalGuards: Blocked unauthorized API call', violation);
          
          // In development, throw error. In production, log and continue
          if (process.env.NODE_ENV === 'development') {
            throw new Error(`Architectural violation: ${violation.message}`);
          }
        }
        
        return originalFetch.apply(window, args);
      };
    }
  }

  // Development-time violation reporting
  flagArchitecturalViolations(): ArchitecturalViolation[] {
    return this.violations;
  }

  private flagViolation(violation: ArchitecturalViolation): void {
    this.violations.push(violation);
    
    // Real-time reporting in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ARCHITECTURAL VIOLATION DETECTED');
      console.error('Type:', violation.type);
      console.error('Component:', violation.component);
      console.error('File:', violation.file);
      console.error('Message:', violation.message);
      console.groupEnd();
    }
  }

  // Component access control
  enforceDataAccessPatterns(): void {
    // Monitor component data access patterns
    this.interceptUnauthorizedRequests();
    
    // Set up performance monitoring for violations
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const violationCount = this.violations.length;
        if (violationCount > 0) {
          console.warn(`⚠️ ArchitecturalGuards: ${violationCount} violations detected in last interval`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Helper methods for violation detection
  private isComponentFile(fileName: string): boolean {
    return fileName.includes('/components/') && 
           !fileName.includes('/core/') && 
           !fileName.includes('/hooks/') &&
           !fileName.includes('/utils/');
  }

  private hasDirectSupabaseImport(line: string): boolean {
    return line.includes('import') && 
           line.includes('supabase') && 
           line.includes('@/integrations/supabase/client');
  }

  private hasDirectApiCall(line: string): boolean {
    return line.includes('supabase.') && 
           (line.includes('.from(') || line.includes('.auth.'));
  }

  private hasUncoordinatedQuery(line: string): boolean {
    return line.includes('useQuery(') && 
           !line.includes('// coordinated') &&
           !line.includes('requestCoordinator');
  }

  private isSupabaseApiCall(url: string): boolean {
    return url.includes('supabase.co') || url.includes('kznasfgubbyinomtetiu');
  }

  private isAuthorizedCaller(): boolean {
    const stack = new Error().stack;
    if (!stack) return false;
    
    // Allow calls from authorized sources
    const authorizedSources = [
      'RequestCoordinator',
      'useStandardizedData',
      'UserInteractionContext',
      'core/',
      'hooks/',
      'utils/'
    ];
    
    return authorizedSources.some(source => stack.includes(source));
  }

  private getCallingComponent(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('/components/')) {
        const match = line.match(/([A-Z][a-zA-Z0-9]*\.tsx?)/);
        if (match) return match[1];
      }
    }
    return 'unknown';
  }

  // Violation reporting and metrics
  getViolationReport() {
    return {
      totalViolations: this.violations.length,
      violationsByType: this.groupViolationsByType(),
      violationsByComponent: this.groupViolationsByComponent(),
      blockedCalls: Array.from(this.blockedCalls)
    };
  }

  private groupViolationsByType() {
    return this.violations.reduce((acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupViolationsByComponent() {
    return this.violations.reduce((acc, violation) => {
      acc[violation.component] = (acc[violation.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Reset violations (for testing/development)
  resetViolations(): void {
    this.violations = [];
    this.blockedCalls.clear();
    console.log('🔄 ArchitecturalGuards: Violations reset');
  }
}

export const architecturalGuards = ArchitecturalGuards.getInstance();
export type { ArchitecturalViolation, BuildError };
