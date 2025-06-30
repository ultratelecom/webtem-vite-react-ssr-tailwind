import { ErrorMonitor } from './ErrorMonitor';

export interface ConsoleInterceptorConfig {
  captureErrors: boolean;
  captureWarnings: boolean;
  captureInfo: boolean;
  captureDebug: boolean;
  filterPatterns?: Array<string | RegExp>;
  maxCapturedMessages: number;
  preserveOriginal: boolean;
}

interface CapturedMessage {
  level: 'error' | 'warn' | 'info' | 'debug' | 'log';
  message: string;
  args: any[];
  timestamp: string;
  stack?: string;
}

class ConsoleInterceptorClass {
  private originalConsole: {
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
    debug: typeof console.debug;
    log: typeof console.log;
  };
  
  private isIntercepting = false;
  private capturedMessages: CapturedMessage[] = [];
  private config: ConsoleInterceptorConfig;
  private listeners: Array<(message: CapturedMessage) => void> = [];

  constructor() {
    // Store original console methods
    this.originalConsole = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
      log: console.log.bind(console),
    };

    // Default configuration
    this.config = {
      captureErrors: true,
      captureWarnings: true,
      captureInfo: false,
      captureDebug: false,
      maxCapturedMessages: 200,
      preserveOriginal: true,
      filterPatterns: [
        // Filter out common noise
        /React DevTools/,
        /Download the React DevTools/,
        /webpack-dev-server/,
        /HMR.*connected/,
        /Live reload enabled/,
      ]
    };
  }

  public start(customConfig?: Partial<ConsoleInterceptorConfig>): void {
    if (this.isIntercepting) {
      console.warn('Console interceptor is already running');
      return;
    }

    // Merge custom config
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    this.isIntercepting = true;

    // Intercept console methods
    if (this.config.captureErrors) {
      console.error = this.createInterceptor('error');
    }
    
    if (this.config.captureWarnings) {
      console.warn = this.createInterceptor('warn');
    }
    
    if (this.config.captureInfo) {
      console.info = this.createInterceptor('info');
      console.log = this.createInterceptor('log');
    }
    
    if (this.config.captureDebug) {
      console.debug = this.createInterceptor('debug');
    }

    console.log('🔍 Console interceptor started - monitoring for errors');
  }

  public stop(): void {
    if (!this.isIntercepting) {
      return;
    }

    // Restore original console methods
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
    console.log = this.originalConsole.log;

    this.isIntercepting = false;
    console.log('🔍 Console interceptor stopped');
  }

  private createInterceptor(level: CapturedMessage['level']) {
    const originalMethod = this.originalConsole[level === 'log' ? 'log' : level];
    
    return (...args: any[]) => {
      // Always call original method if preserveOriginal is true
      if (this.config.preserveOriginal) {
        originalMethod(...args);
      }

      try {
        // Process and capture the message
        this.processMessage(level, args);
      } catch (error) {
        // Avoid infinite loops - use original console method
        this.originalConsole.error('Error in console interceptor:', error);
      }
    };
  }

  private processMessage(level: CapturedMessage['level'], args: any[]): void {
    // Convert arguments to string message
    const message = args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      } else if (arg instanceof Error) {
        return arg.message;
      } else if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      } else {
        return String(arg);
      }
    }).join(' ');

    // Apply filters
    if (this.shouldFilterMessage(message)) {
      return;
    }

    // Capture stack trace for errors
    let stack: string | undefined;
    if (level === 'error') {
      stack = new Error().stack;
    }

    // Create captured message
    const capturedMessage: CapturedMessage = {
      level,
      message,
      args,
      timestamp: new Date().toISOString(),
      stack
    };

    // Store message
    this.capturedMessages.unshift(capturedMessage);
    if (this.capturedMessages.length > this.config.maxCapturedMessages) {
      this.capturedMessages = this.capturedMessages.slice(0, this.config.maxCapturedMessages);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(capturedMessage);
      } catch (error) {
        this.originalConsole.error('Error in console interceptor listener:', error);
      }
    });

    // Report errors to ErrorMonitor
    if (level === 'error') {
      this.reportToErrorMonitor(capturedMessage, args);
    }
  }

  private shouldFilterMessage(message: string): boolean {
    if (!this.config.filterPatterns) {
      return false;
    }

    return this.config.filterPatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(message);
      } else {
        return message.includes(pattern);
      }
    });
  }

  private reportToErrorMonitor(capturedMessage: CapturedMessage, args: any[]): void {
    try {
      // Try to find an Error object in the arguments
      let error = args.find(arg => arg instanceof Error);
      
      if (!error) {
        // Create an Error from the message
        error = new Error(capturedMessage.message);
        if (capturedMessage.stack) {
          error.stack = capturedMessage.stack;
        }
      }

      // Report to ErrorMonitor
      ErrorMonitor.reportError({
        type: 'console_error',
        error,
        timestamp: capturedMessage.timestamp,
        context: {
          level: capturedMessage.level,
          args: args,
          originalMessage: capturedMessage.message
        }
      });
    } catch (error) {
      this.originalConsole.error('Failed to report console error to ErrorMonitor:', error);
    }
  }

  public getCapturedMessages(limit?: number): CapturedMessage[] {
    return limit ? this.capturedMessages.slice(0, limit) : [...this.capturedMessages];
  }

  public getMessagesByLevel(level: CapturedMessage['level'], limit?: number): CapturedMessage[] {
    const filtered = this.capturedMessages.filter(msg => msg.level === level);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  public clearCapturedMessages(): void {
    this.capturedMessages = [];
  }

  public addListener(listener: (message: CapturedMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public updateConfig(newConfig: Partial<ConsoleInterceptorConfig>): void {
    const wasIntercepting = this.isIntercepting;
    
    if (wasIntercepting) {
      this.stop();
    }
    
    this.config = { ...this.config, ...newConfig };
    
    if (wasIntercepting) {
      this.start();
    }
  }

  public getConfig(): ConsoleInterceptorConfig {
    return { ...this.config };
  }

  public isRunning(): boolean {
    return this.isIntercepting;
  }

  public getStats(): {
    totalMessages: number;
    messagesByLevel: Record<CapturedMessage['level'], number>;
    recentMessages: CapturedMessage[];
    isIntercepting: boolean;
  } {
    const messagesByLevel: Record<CapturedMessage['level'], number> = {
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
      log: 0
    };

    this.capturedMessages.forEach(msg => {
      messagesByLevel[msg.level]++;
    });

    return {
      totalMessages: this.capturedMessages.length,
      messagesByLevel,
      recentMessages: this.capturedMessages.slice(0, 5),
      isIntercepting: this.isIntercepting
    };
  }

  public searchMessages(query: string): CapturedMessage[] {
    const lowerQuery = query.toLowerCase();
    return this.capturedMessages.filter(msg =>
      msg.message.toLowerCase().includes(lowerQuery) ||
      msg.level.toLowerCase().includes(lowerQuery)
    );
  }

  public exportMessages(): string {
    const exportData = {
      messages: this.capturedMessages,
      config: this.config,
      stats: this.getStats(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Debug utilities
  public testError(): void {
    console.error('Test error from ConsoleInterceptor');
  }

  public testWarning(): void {
    console.warn('Test warning from ConsoleInterceptor');
  }

  public testInfo(): void {
    console.info('Test info from ConsoleInterceptor');
  }
}

// Create singleton instance
export const ConsoleInterceptor = new ConsoleInterceptorClass(); 