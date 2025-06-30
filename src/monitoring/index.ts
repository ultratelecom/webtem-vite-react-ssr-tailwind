// Export all monitoring components
export { ErrorBoundary } from './ErrorBoundary';
export { ErrorMonitor } from './ErrorMonitor';
export { FixRegistry } from './FixRegistry';
export { ConsoleInterceptor } from './ConsoleInterceptor';

// Import for internal use
import { ErrorMonitor } from './ErrorMonitor';
import { FixRegistry } from './FixRegistry';
import { ConsoleInterceptor } from './ConsoleInterceptor';
import type { ErrorReport } from './ErrorMonitor';

// Export types
export type { ErrorReport, ErrorStats } from './ErrorMonitor';
export type { ErrorFix, FixResult } from './FixRegistry';
export type { ConsoleInterceptorConfig } from './ConsoleInterceptor';

// Central monitoring system
export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private initialized = false;

  private constructor() {}

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      console.warn('Monitoring system is already initialized');
      return;
    }

    console.log('🚀 Initializing Self-Healing Monitoring System...');

    try {
      // Load persisted errors
      ErrorMonitor.loadPersistedErrors();
      console.log('✅ Error Monitor: Loaded persisted errors');

      // Start console interception
      ConsoleInterceptor.start({
        captureErrors: true,
        captureWarnings: true,
        captureInfo: false,
        captureDebug: false,
      });
      console.log('✅ Console Interceptor: Started monitoring');

      // Set up error listeners
      this.setupErrorListeners();
      console.log('✅ Error Listeners: Configured');

      this.initialized = true;
      console.log('🎉 Self-Healing Monitoring System is now active!');
      
      // Display system status
      this.displaySystemStatus();

    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error);
    }
  }

  private setupErrorListeners(): void {
    // Listen to console errors and provide real-time feedback
    ConsoleInterceptor.addListener((message: any) => {
      if (message.level === 'error') {
        console.log(`🔍 Monitoring System: Captured ${message.level} - "${message.message}"`);
      }
    });

    // Listen to error monitor reports
    ErrorMonitor.addListener((report: ErrorReport) => {
      console.log(`📊 Error Report: ${report.type} - ${report.error.message}`);
    });
  }

  private displaySystemStatus(): void {
    const errorStats = ErrorMonitor.getErrorStats();
    const consoleStats = ConsoleInterceptor.getStats();
    const fixStats = FixRegistry.getFixStats();

    console.group('📈 Monitoring System Status');
    console.log(`🔢 Total Errors Tracked: ${errorStats.totalErrors}`);
    console.log(`📝 Console Messages: ${consoleStats.totalMessages}`);
    console.log(`🔧 Available Fixes: ${Object.keys(fixStats).length}`);
    console.log(`🎯 Console Interceptor: ${consoleStats.isIntercepting ? 'Active' : 'Inactive'}`);
    console.groupEnd();
  }

  public getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    errorMonitor: boolean;
    consoleInterceptor: boolean;
    fixRegistry: boolean;
    recentErrors: number;
    systemUptime: string;
  } {
    const errorStats = ErrorMonitor.getErrorStats();
    const consoleStats = ConsoleInterceptor.getStats();
    
    // Calculate recent errors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentErrors = errorStats.recentErrors.filter(
      error => error.timestamp > fiveMinutesAgo
    ).length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (recentErrors > 10) {
      status = 'critical';
    } else if (recentErrors > 5) {
      status = 'warning';
    }

    return {
      status,
      errorMonitor: true,
      consoleInterceptor: consoleStats.isIntercepting,
      fixRegistry: FixRegistry.getAllFixes().length > 0,
      recentErrors,
      systemUptime: this.getUptime()
    };
  }

  private getUptime(): string {
    // Simple uptime calculation (would be more sophisticated in production)
    return `${Math.floor(performance.now() / 1000)}s`;
  }

  public shutdown(): void {
    if (!this.initialized) {
      return;
    }

    console.log('🛑 Shutting down monitoring system...');

    try {
      ConsoleInterceptor.stop();
      this.initialized = false;
      console.log('✅ Monitoring system shutdown complete');
    } catch (error) {
      console.error('❌ Error during monitoring system shutdown:', error);
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public restart(): void {
    this.shutdown();
    setTimeout(() => {
      this.initialize();
    }, 1000);
  }

  // Development utilities
  public triggerTestError(): void {
    console.error('🧪 Test error triggered by monitoring system');
    throw new Error('Test error for monitoring system validation');
  }

  public generateSystemReport(): string {
    const health = this.getSystemHealth();
    const errorStats = ErrorMonitor.getErrorStats();
    const fixStats = FixRegistry.getFixStats();
    const consoleStats = ConsoleInterceptor.getStats();

    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: health,
      errorStats,
      fixStats,
      consoleStats,
      availableFixes: FixRegistry.getAllFixes().map(fix => ({
        id: fix.id,
        name: fix.name,
        category: fix.category,
        priority: fix.priority
      }))
    };

    return JSON.stringify(report, null, 2);
  }
}

// Create singleton instance
export const monitoringSystem = MonitoringSystem.getInstance(); 