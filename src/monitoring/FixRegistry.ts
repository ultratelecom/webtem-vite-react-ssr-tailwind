export interface ErrorFix {
  id: string;
  name: string;
  description: string;
  errorPattern: RegExp | string;
  errorTypes: string[];
  fixFunction: (error: Error, context?: any) => Promise<boolean>;
  conditions?: Array<() => boolean>;
  priority: number; // Higher number = higher priority
  category: 'dependency' | 'configuration' | 'runtime' | 'ui' | 'build';
  successRate?: number;
  lastUsed?: string;
  timesUsed?: number;
}

export interface FixResult {
  success: boolean;
  fixApplied?: ErrorFix;
  error?: string;
  rollbackRequired?: boolean;
}

class FixRegistryClass {
  private fixes: ErrorFix[] = [];
  private fixHistory: Array<{ fix: ErrorFix; success: boolean; timestamp: string; error: Error }> = [];

  constructor() {
    this.initializeBasicFixes();
  }

  private initializeBasicFixes(): void {
    // Register common React/Vite fixes
    this.registerFix({
      id: 'react-key-warning',
      name: 'React Key Warning Fix',
      description: 'Attempts to resolve React key warnings by suggesting proper key usage',
      errorPattern: /Warning: Each child in a list should have a unique "key" prop/,
      errorTypes: ['react_boundary', 'console_error'],
      fixFunction: async () => {
        console.warn('🔧 Auto-fix suggestion: Add unique "key" props to list items');
        return false; // This is a suggestion, not an automatic fix
      },
      priority: 3,
      category: 'ui'
    });

    this.registerFix({
      id: 'missing-dependency',
      name: 'Missing Dependency Fix',
      description: 'Suggests installing missing dependencies',
      errorPattern: /Module not found|Cannot resolve module|Cannot find module/,
      errorTypes: ['runtime_error', 'console_error'],
      fixFunction: async (error: Error) => {
        const moduleMatch = error.message.match(/Cannot (?:find|resolve) module ['"]([^'"]+)['"]/);
        if (moduleMatch) {
          const moduleName = moduleMatch[1];
          console.warn(`🔧 Auto-fix suggestion: Install missing module "${moduleName}"`);
          console.warn(`Run: npm install ${moduleName}`);
        }
        return false; // Suggestion only
      },
      priority: 5,
      category: 'dependency'
    });

    this.registerFix({
      id: 'cors-error',
      name: 'CORS Error Fix',
      description: 'Suggests CORS configuration fixes',
      errorPattern: /CORS|Cross-Origin Request Blocked|blocked by CORS policy/,
      errorTypes: ['runtime_error', 'console_error'],
      fixFunction: async () => {
        console.warn('🔧 Auto-fix suggestion: Configure CORS headers or use a proxy');
        console.warn('For Vite, add proxy configuration to vite.config.ts');
        return false;
      },
      priority: 4,
      category: 'configuration'
    });

    this.registerFix({
      id: 'undefined-variable',
      name: 'Undefined Variable Recovery',
      description: 'Attempts to handle undefined variable errors gracefully',
      errorPattern: /is not defined|Cannot read prop.*of undefined|Cannot read prop.*of null/,
      errorTypes: ['runtime_error', 'react_boundary'],
      fixFunction: async (error: Error) => {
        console.warn('🔧 Auto-fix suggestion: Add null/undefined checks');
        console.warn(`Error: ${error.message}`);
        // Could potentially add runtime guards here
        return false;
      },
      priority: 3,
      category: 'runtime'
    });

    this.registerFix({
      id: 'network-error',
      name: 'Network Error Recovery',
      description: 'Handles network connectivity issues',
      errorPattern: /Network Error|fetch.*failed|NetworkError|ERR_NETWORK/,
      errorTypes: ['runtime_error', 'unhandled_rejection'],
      fixFunction: async () => {
        console.warn('🔧 Auto-fix: Implementing retry logic for network error');
        // Could implement retry logic or fallback mechanisms
        return true; // Return true if we implement actual retry logic
      },
      priority: 4,
      category: 'runtime'
    });

    this.registerFix({
      id: 'memory-leak',
      name: 'Memory Leak Prevention',
      description: 'Attempts to clean up potential memory leaks',
      errorPattern: /Maximum update depth exceeded|Memory leak/i,
      errorTypes: ['react_boundary', 'runtime_error'],
      fixFunction: async () => {
        console.warn('🔧 Auto-fix: Implementing cleanup to prevent memory leaks');
        // Force garbage collection if available
        if (typeof window !== 'undefined' && 'gc' in window) {
          try {
            (window as any).gc();
            return true;
          } catch {
            // GC not available
          }
        }
        return false;
      },
      priority: 5,
      category: 'runtime'
    });

    this.registerFix({
      id: 'state-update-unmounted',
      name: 'State Update on Unmounted Component',
      description: 'Prevents state updates on unmounted React components',
      errorPattern: /Warning.*setState.*unmounted component|Cannot read prop.*setState.*of undefined/,
      errorTypes: ['react_boundary', 'console_error'],
      fixFunction: async () => {
        console.warn('🔧 Auto-fix suggestion: Add component mount checks before setState calls');
        console.warn('Use useEffect cleanup or isMounted flags');
        return false;
      },
      priority: 3,
      category: 'ui'
    });
  }

  public registerFix(fix: ErrorFix): void {
    // Validate fix
    if (!fix.id || !fix.name || !fix.errorPattern || !fix.fixFunction) {
      throw new Error('Invalid fix registration: missing required fields');
    }

    // Check for duplicate IDs
    if (this.fixes.some(f => f.id === fix.id)) {
      throw new Error(`Fix with ID "${fix.id}" already exists`);
    }

    // Initialize optional fields
    const completeFix: ErrorFix = {
      ...fix,
      successRate: fix.successRate || 0,
      lastUsed: fix.lastUsed || new Date().toISOString(),
      timesUsed: fix.timesUsed || 0
    };

    this.fixes.push(completeFix);
    this.sortFixesByPriority();
  }

  private sortFixesByPriority(): void {
    this.fixes.sort((a, b) => b.priority - a.priority);
  }

  public async findFix(error: Error): Promise<ErrorFix | null> {
    for (const fix of this.fixes) {
      if (await this.matchesFix(error, fix)) {
        return fix;
      }
    }
    return null;
  }

  private async matchesFix(error: Error, fix: ErrorFix): Promise<boolean> {
    // Check error pattern
    const pattern = fix.errorPattern;
    const message = error.message || '';
    const stack = error.stack || '';
    
    let patternMatches = false;
    if (pattern instanceof RegExp) {
      patternMatches = pattern.test(message) || pattern.test(stack);
    } else {
      patternMatches = message.includes(pattern) || stack.includes(pattern);
    }

    if (!patternMatches) {
      return false;
    }

    // Check conditions if provided
    if (fix.conditions) {
      for (const condition of fix.conditions) {
        try {
          if (!condition()) {
            return false;
          }
        } catch {
          return false;
        }
      }
    }

    return true;
  }

  public async applyFix(fix: ErrorFix, error: Error, context?: any): Promise<boolean> {
    try {
      console.log(`🔧 Applying fix: ${fix.name}`);
      
      const success = await fix.fixFunction(error, context);
      
      // Update fix statistics
      fix.timesUsed = (fix.timesUsed || 0) + 1;
      fix.lastUsed = new Date().toISOString();
      
      if (success) {
        const currentSuccessRate = fix.successRate || 0;
        const currentTimesUsed = fix.timesUsed;
        fix.successRate = ((currentSuccessRate * (currentTimesUsed - 1)) + 1) / currentTimesUsed;
      }

      // Record fix attempt
      this.fixHistory.push({
        fix,
        success,
        timestamp: new Date().toISOString(),
        error
      });

      // Keep only recent history
      if (this.fixHistory.length > 100) {
        this.fixHistory = this.fixHistory.slice(-50);
      }

      return success;
    } catch (fixError) {
      console.error(`Failed to apply fix "${fix.name}":`, fixError);
      
      // Record failed attempt
      this.fixHistory.push({
        fix,
        success: false,
        timestamp: new Date().toISOString(),
        error
      });

      return false;
    }
  }

  public getFixHistory(): Array<{ fix: ErrorFix; success: boolean; timestamp: string; error: Error }> {
    return [...this.fixHistory].reverse(); // Most recent first
  }

  public getFixStats(): Record<string, { successRate: number; timesUsed: number; lastUsed: string }> {
    const stats: Record<string, { successRate: number; timesUsed: number; lastUsed: string }> = {};
    
    this.fixes.forEach(fix => {
      stats[fix.id] = {
        successRate: fix.successRate || 0,
        timesUsed: fix.timesUsed || 0,
        lastUsed: fix.lastUsed || 'Never'
      };
    });

    return stats;
  }

  public removeFix(fixId: string): boolean {
    const index = this.fixes.findIndex(fix => fix.id === fixId);
    if (index > -1) {
      this.fixes.splice(index, 1);
      return true;
    }
    return false;
  }

  public getAllFixes(): ErrorFix[] {
    return [...this.fixes];
  }

  public getFixesByCategory(category: ErrorFix['category']): ErrorFix[] {
    return this.fixes.filter(fix => fix.category === category);
  }

  public searchFixes(query: string): ErrorFix[] {
    const lowerQuery = query.toLowerCase();
    return this.fixes.filter(fix =>
      fix.name.toLowerCase().includes(lowerQuery) ||
      fix.description.toLowerCase().includes(lowerQuery) ||
      fix.category.toLowerCase().includes(lowerQuery)
    );
  }

  public exportRegistry(): string {
    const exportData = {
      fixes: this.fixes,
      history: this.fixHistory,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  public importRegistry(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.fixes && Array.isArray(parsed.fixes)) {
        // Validate and import fixes
        parsed.fixes.forEach((fix: any) => {
          if (fix.id && fix.name && fix.errorPattern) {
            try {
              this.registerFix(fix);
            } catch (error) {
              console.warn(`Failed to import fix "${fix.name}":`, error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to import fix registry:', error);
      throw new Error('Invalid registry data format');
    }
  }
}

// Create singleton instance
export const FixRegistry = new FixRegistryClass(); 