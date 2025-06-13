
// ABOUTME: Component migration tracking utility for Phase B systematic migration
// Identifies components requiring migration to coordinated data access patterns

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

    // Phase B - HIGH PRIORITY components requiring migration
    this.registerComponent({
      componentName: 'ArticleCard',
      filePath: 'src/components/dashboard/ArticleCard.tsx',
      migrationStatus: 'pending',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 2,
      hasIndividualHooks: true,
      priority: 'high',
      estimatedEffort: 'medium',
      notes: ['Uses useUserInteractionContext - needs coordination review', 'Individual bookmark/reaction API calls']
    });

    this.registerComponent({
      componentName: 'IssueEditor',
      filePath: 'src/pages/dashboard/IssueEditor.tsx',
      migrationStatus: 'pending',
      hasDirectSupabaseImport: true,
      hasDirectApiCalls: 5,
      hasIndividualHooks: true,
      priority: 'high',
      estimatedEffort: 'large',
      notes: ['Direct supabase imports', 'Multiple individual API calls', 'Complex editor logic']
    });

    this.registerComponent({
      componentName: 'Edit',
      filePath: 'src/pages/dashboard/Edit.tsx',
      migrationStatus: 'pending',
      hasDirectSupabaseImport: false,
      hasDirectApiCalls: 0,
      hasIndividualHooks: false,
      priority: 'low',
      estimatedEffort: 'small',
      notes: ['Admin panel - low API impact', 'Mostly UI composition']
    });

    this.registerComponent({
      componentName: 'ArticleViewer',
      filePath: 'src/pages/dashboard/ArticleViewer.tsx',
      migrationStatus: 'pending',
      hasDirectSupabaseImport: true,
      hasDirectApiCalls: 1,
      hasIndividualHooks: true,
      priority: 'medium',
      estimatedEffort: 'medium',
      notes: ['Uses useQuery with direct supabase', 'Router component - needs coordination']
    });

    console.log('🔍 ComponentMigrationTracker: Inventory initialized with component analysis');
  }

  registerComponent(status: ComponentMigrationStatus): void {
    this.migrationStatus.set(status.componentName, status);
  }

  updateComponentStatus(componentName: string, updates: Partial<ComponentMigrationStatus>): void {
    const current = this.migrationStatus.get(componentName);
    if (current) {
      this.migrationStatus.set(componentName, { ...current, ...updates });
    }
  }

  getHighPriorityPendingComponents(): ComponentMigrationStatus[] {
    return Array.from(this.migrationStatus.values())
      .filter(status => status.priority === 'high' && status.migrationStatus === 'pending')
      .sort((a, b) => b.hasDirectApiCalls - a.hasDirectApiCalls);
  }

  getPendingComponents(): ComponentMigrationStatus[] {
    return Array.from(this.migrationStatus.values())
      .filter(status => status.migrationStatus === 'pending')
      .sort((a, b) => {
        // Sort by priority, then by API call count
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.hasDirectApiCalls - a.hasDirectApiCalls;
      });
  }

  getMigrationReport(): MigrationReport {
    const components = Array.from(this.migrationStatus.values());
    const completed = components.filter(c => c.migrationStatus === 'completed');
    const pending = components.filter(c => c.migrationStatus === 'pending');
    const highPriority = components.filter(c => c.priority === 'high' && c.migrationStatus === 'pending');
    
    const estimatedApiCallReduction = pending.reduce((sum, component) => {
      return sum + component.hasDirectApiCalls;
    }, 0);

    return {
      totalComponents: components.length,
      completed: completed.length,
      pending: pending.length,
      highPriority: highPriority.length,
      estimatedApiCallReduction
    };
  }

  logMigrationProgress(): void {
    const report = this.getMigrationReport();
    const progress = (report.completed / report.totalComponents) * 100;

    console.group('📊 Phase B Migration Progress');
    console.log(`Progress: ${progress.toFixed(1)}% (${report.completed}/${report.totalComponents})`);
    console.log(`Pending: ${report.pending} components`);
    console.log(`High Priority: ${report.highPriority} components`);
    console.log(`Estimated API Call Reduction: ${report.estimatedApiCallReduction} calls`);
    
    const highPriorityComponents = this.getHighPriorityPendingComponents();
    if (highPriorityComponents.length > 0) {
      console.log('\n🎯 Next High Priority Migrations:');
      highPriorityComponents.slice(0, 3).forEach(component => {
        console.log(`- ${component.componentName}: ${component.hasDirectApiCalls} API calls`);
      });
    }
    console.groupEnd();
  }

  // Get next component to migrate based on priority and impact
  getNextMigrationTarget(): ComponentMigrationStatus | null {
    const pending = this.getPendingComponents();
    return pending.length > 0 ? pending[0] : null;
  }
}

export const componentMigrationTracker = ComponentMigrationTracker.getInstance();
export type { ComponentMigrationStatus, MigrationReport };
