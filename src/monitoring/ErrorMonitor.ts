import winston from 'winston';
import type { ErrorInfo } from 'react';

export interface ErrorReport {
  type: 'react_boundary' | 'console_error' | 'unhandled_rejection' | 'runtime_error';
  error: Error;
  errorInfo?: ErrorInfo;
  timestamp: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByMessage: Record<string, number>;
  recentErrors: ErrorReport[];
  topErrors: Array<{ message: string; count: number; lastOccurred: string }>;
}

class ErrorMonitorClass {
  private logger!: winston.Logger;
  private errors: ErrorReport[] = [];
  private maxStoredErrors = 100;
  private sessionId: string;
  private listeners: Array<(report: ErrorReport) => void> = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Add file transport if in Node.js environment
    if (typeof window === 'undefined') {
      this.logger.add(new winston.transports.File({ 
        filename: 'error-monitor.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }));
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          type: 'unhandled_rejection',
          error: new Error(event.reason?.toString() || 'Unhandled Promise Rejection'),
          timestamp: new Date().toISOString(),
          context: {
            reason: event.reason,
            promise: event.promise
          }
        });
      });

      // Handle global errors
      window.addEventListener('error', (event) => {
        this.reportError({
          type: 'runtime_error',
          error: event.error || new Error(event.message),
          timestamp: new Date().toISOString(),
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });
    }
  }

  public reportError(report: ErrorReport): void {
    // Enhance report with additional context
    const enhancedReport: ErrorReport = {
      ...report,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Store error
    this.errors.unshift(enhancedReport);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors);
    }

    // Log error
    this.logger.error('Error reported', {
      type: enhancedReport.type,
      message: enhancedReport.error.message,
      stack: enhancedReport.error.stack,
      context: enhancedReport.context,
      sessionId: enhancedReport.sessionId
    });

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(enhancedReport);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });

    // Persist to localStorage if available
    this.persistErrors();
  }

  private persistErrors(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const errorData = {
          errors: this.errors.slice(0, 20), // Store only recent errors
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        };
        localStorage.setItem('error-monitor-data', JSON.stringify(errorData));
      } catch (error) {
        console.warn('Failed to persist errors to localStorage:', error);
      }
    }
  }

  public loadPersistedErrors(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('error-monitor-data');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.errors && Array.isArray(data.errors)) {
            // Only load errors from recent sessions (last 24 hours)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const recentErrors = data.errors.filter((error: ErrorReport) => 
              error.timestamp > oneDayAgo
            );
            this.errors = [...recentErrors, ...this.errors];
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted errors:', error);
      }
    }
  }

  public getErrorStats(): ErrorStats {
    const errorsByType: Record<string, number> = {};
    const errorsByMessage: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      const message = error.error.message || 'Unknown error';
      errorsByMessage[message] = (errorsByMessage[message] || 0) + 1;
    });

    const topErrors = Object.entries(errorsByMessage)
      .map(([message, count]) => ({
        message,
        count,
        lastOccurred: this.errors.find(e => e.error.message === message)?.timestamp || ''
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsByMessage,
      recentErrors: this.errors.slice(0, 10),
      topErrors
    };
  }

  public getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  public clearErrors(): void {
    this.errors = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('error-monitor-data');
    }
  }

  public addListener(listener: (report: ErrorReport) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public searchErrors(query: string): ErrorReport[] {
    const lowerQuery = query.toLowerCase();
    return this.errors.filter(error => 
      error.error.message.toLowerCase().includes(lowerQuery) ||
      error.error.stack?.toLowerCase().includes(lowerQuery) ||
      error.type.toLowerCase().includes(lowerQuery)
    );
  }

  public getErrorTrends(): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};
    
    this.errors.forEach(error => {
      const date = error.timestamp.split('T')[0]; // Get just the date part
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  public exportErrors(): string {
    const exportData = {
      sessionId: this.sessionId,
      exportDate: new Date().toISOString(),
      errors: this.errors,
      stats: this.getErrorStats()
    };
    return JSON.stringify(exportData, null, 2);
  }
}

// Create singleton instance
export const ErrorMonitor = new ErrorMonitorClass(); 