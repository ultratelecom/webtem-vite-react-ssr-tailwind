import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorMonitor } from './ErrorMonitor';
import { FixRegistry } from './FixRegistry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  recoveryAttempts: number;
  autoFixApplied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private recoveryTimer: NodeJS.Timeout | null = null;
  private maxRecoveryAttempts = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempts: 0,
      autoFixApplied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring system
    ErrorMonitor.reportError({
      type: 'react_boundary',
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      context: {
        component: errorInfo.componentStack,
        props: this.props,
      }
    });

    // Call user-defined error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt automatic recovery
    this.attemptAutoRecovery(error);
  }

  private async attemptAutoRecovery(error: Error) {
    const { recoveryAttempts } = this.state;
    
    if (recoveryAttempts >= this.maxRecoveryAttempts) {
      console.warn('Max recovery attempts reached for error:', error.message);
      return;
    }

    this.setState({ isRecovering: true });

    try {
      // Check if we have a known fix for this error
      const fix = await FixRegistry.findFix(error);
      
      if (fix) {
        console.log(`Applying auto-fix: ${fix.name}`);
        const success = await FixRegistry.applyFix(fix, error);
        
        if (success) {
          this.setState({ autoFixApplied: true });
          this.scheduleRecovery();
          return;
        }
      }

      // Generic recovery attempt - wait and retry
      this.scheduleRecovery();
      
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  }

  private scheduleRecovery() {
    // Clear any existing timer
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    // Schedule recovery after a delay
    this.recoveryTimer = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        recoveryAttempts: prevState.recoveryAttempts + 1,
      }));
    }, 2000 + (this.state.recoveryAttempts * 1000)); // Increasing delay
  }

  componentWillUnmount() {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      autoFixApplied: false,
    });
  };

  private getErrorDisplay() {
    const { error, errorInfo, isRecovering, autoFixApplied, recoveryAttempts } = this.state;

    return (
      <div className="error-boundary-container" style={{
        padding: '20px',
        margin: '20px',
        border: '2px solid #ff6b6b',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
        fontFamily: 'monospace',
      }}>
        <h2 style={{ color: '#d63384', marginBottom: '16px' }}>
          🚨 Application Error Detected
        </h2>
        
        {isRecovering && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <strong>🔄 Auto-Recovery in Progress...</strong>
            {autoFixApplied && <div>✅ Automatic fix applied</div>}
            <div>Attempt {recoveryAttempts + 1} of {this.maxRecoveryAttempts}</div>
          </div>
        )}

        <details style={{ marginBottom: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Error Details
          </summary>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa' }}>
            <strong>Message:</strong> {error?.message}<br/>
            <strong>Stack:</strong>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {error?.stack}
            </pre>
            {errorInfo && (
              <>
                <strong>Component Stack:</strong>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        </details>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={this.handleManualRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={isRecovering}
          >
            {isRecovering ? 'Recovering...' : 'Retry'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12px', color: '#6c757d' }}>
          Recovery attempts: {recoveryAttempts}/{this.maxRecoveryAttempts}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback or default error display
      return this.props.fallback || this.getErrorDisplay();
    }

    return this.props.children;
  }
} 