
// ABOUTME: Component migration tracking utility for Phase B systematic migration
// Updated with completed IssueEditor and ArticleViewer migrations - PHASE B COMPLETE

interface ComponentMigrationStatus {
  componentName: string;
  filePath: string;
  migrationStatus: 'pending' | 'in-progress' | 'completed' | 'skipped';
  hasDirectSupabaseImport: boolean;
  hasDirectApiCalls: number;
  hasIndividualHooks: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: 'small' | 'medium' | 'large';
  notes: string[];
}

interface MigrationReport {
  totalComponents: number;
  completed: number;
  pending: number;
  highPriority: number;
  estimatedApiCallReduction: number;
}

class ComponentMigrationTracker {
  private static instance: ComponentMigrationTracker;
  private migrationStatus: Map<string, ComponentMigrationStatus> = new Map();

  private constructor() {
    this.initializeComponentInventory();
  }

  static getInstance(): ComponentMigrationTracker {
    if (!ComponentMigrationTracker.instance) {
      ComponentMigrationTracker.instance = new ComponentMigrationTracker();
    }
    return ComponentMigrationTracker.instance;
  }

  // Initialize comprehensive component inventory based on codebase analysis
  private initializeComponentInventory(): void {
    // Phase A - COMPLETED components
    this.registerComponent({
      componentName: 'Dashboard',
      filePath: 'src/pages/dashboard/Dashboard.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'large',
      notes: ['✅ Migrated to useStandardizedData', '✅ Using coordinated page data loading']
    });

    this.registerComponent({
      componentName: 'ArchivePage',
      filePath: 'src/pages/dashboard/ArchivePage.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'large',
      notes: ['✅ Migrated to useStandardizedData', '✅ Using coordinated bulk loading']
    });

    this.registerComponent({
      componentName: 'StandardizedArticleCard',
      filePath: 'src/components/cards/StandardizedArticleCard.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'medium',
      notes: ['✅ Using coordinated user interaction data']
    });

    // Phase B - HIGH PRIORITY components - ALL COMPLETED
    this.registerComponent({
      componentName: 'ArticleCard',
      filePath: 'src/components/dashboard/ArticleCard.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'medium',
      notes: ['✅ Migrated to coordinated user context', '✅ Removed individual bookmark/reaction API calls']
    });

    this.registerComponent({
      componentName: 'IssueEditor',
      filePath: 'src/pages/dashboard/IssueEditor.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'large',
      notes: ['✅ Migrated to coordinated data access', '✅ Using standardized page data loading', '✅ Architectural compliance achieved']
    });

    this.registerComponent({
      componentName: 'ArticleViewer',
      filePath: 'src/pages/dashboard/ArticleViewer.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'high',
      estimatedEffort: 'large',
      notes: ['✅ Migrated to coordinated data access', '✅ Using standardized page data loading', '✅ Architectural compliance achieved']
    });

    // Homepage components - COMPLETED
    this.registerComponent({
      componentName: 'FeaturedSection',
      filePath: 'src/components/homepage/sections/FeaturedSection.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'medium',
      estimatedEffort: 'small',
      notes: ['✅ Using coordinated data access patterns']
    });

    this.registerComponent({
      componentName: 'RecentSection',
      filePath: 'src/components/homepage/sections/RecentSection.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'medium',
      estimatedEffort: 'small',
      notes: ['✅ Using coordinated data access patterns']
    });

    this.registerComponent({
      componentName: 'SectionFactory',
      filePath: 'src/components/homepage/SectionFactory.tsx',
      migrationStatus: 'completed',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'medium',
      estimatedEffort: 'small',
      notes: ['✅ Using coordinated data access patterns']
    });

    // Lower priority components that may benefit from future optimization
    this.registerComponent({
      componentName: 'UserProfile',
      filePath: 'src/components/user/UserProfile.tsx',
      migrationStatus: 'skipped',
      hasDirectSupabaseImport: true,
      hasDirectApiCalls: 2,
      hasIndividualHooks: true,
      priority: 'low',
      estimatedEffort: 'medium',
      notes: ['Low usage component', 'Individual API calls acceptable for now']
    });

    this.registerComponent({
      componentName: 'CommentSection',
      filePath: 'src/components/comments/CommentSection.tsx',
      migrationStatus: 'skipped',
      hasDirectSupabaseImport: true,
      hasDirectApiCalls: 3,
      hasIndividualHooks: true,
      priority: 'low',
      estimatedEffort: 'large',
      notes: ['Complex interaction patterns', 'Real-time updates required', 'Phase C candidate']
    });
  }

  private registerComponent(status: ComponentMigrationStatus): void {
    this.migrationStatus.set(status.componentName, status);
  }

  public getMigrationReport(): MigrationReport {
    const components = Array.from(this.migrationStatus.values());
    const completed = components.filter(c => c.migrationStatus === 'completed').length;
    const pending = components.filter(c => c.migrationStatus === 'pending').length;
    const highPriority = components.filter(c => c.priority === 'high').length;
    
    // Calculate estimated API call reduction from completed migrations
    const completedComponents = components.filter(c => c.migrationStatus === 'completed');
    const estimatedApiCallReduction = completedComponents.reduce((total, comp) => {
      return total + comp.hasDirectApiCalls;
    }, 0);

    return {
      totalComponents: components.length,
      completed,
      pending,
      highPriority,
      estimatedApiCallReduction
    };
  }

  public getComponentStatus(componentName: string): ComponentMigrationStatus | null {
    return this.migrationStatus.get(componentName) || null;
  }

  public getAllComponentStatuses(): ComponentMigrationStatus[] {
    return Array.from(this.migrationStatus.values());
  }

  public updateComponentStatus(componentName: string, updates: Partial<ComponentMigrationStatus>): void {
    const existing = this.migrationStatus.get(componentName);
    if (existing) {
      this.migrationStatus.set(componentName, { ...existing, ...updates });
    }
  }

  // Phase B completion validation
  public validatePhaseBCompletion(): { isComplete: boolean; summary: string } {
    const report = this.getMigrationReport();
    const highPriorityComponents = this.getAllComponentStatuses().filter(c => c.priority === 'high');
    const completedHighPriority = highPriorityComponents.filter(c => c.migrationStatus === 'completed');
    
    const isComplete = completedHighPriority.length === highPriorityComponents.length;
    
    const summary = `Phase B Migration Status:
- High Priority Components: ${highPriorityComponents.length}
- Completed: ${completedHighPriority.length}
- Total API Call Reduction: ${report.estimatedApiCallReduction}
- Completion Rate: ${Math.round((report.completed / report.totalComponents) * 100)}%
- Phase B Complete: ${isComplete ? '✅ YES' : '❌ NO'}`;

    return { isComplete, summary };
  }
}

// Export singleton instance
export const componentMigrationTracker = ComponentMigrationTracker.getInstance();

// Helper functions for easy access
export const getMigrationReport = () => componentMigrationTracker.getMigrationReport();
export const validatePhaseBCompletion = () => componentMigrationTracker.validatePhaseBCompletion();
export const getComponentStatus = (componentName: string) => componentMigrationTracker.getComponentStatus(componentName);
