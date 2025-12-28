import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React errors and prevents full app crashes.
 * Displays a fallback UI when an error occurs.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
          }}>⚠️</div>
          <h2 style={{ marginBottom: '10px' }}>Something went wrong</h2>
          <p style={{
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.5',
          }}>
            An unexpected error occurred. This has been logged and we'll look into it.
          </p>
          {this.state.error && (
            <details style={{
              textAlign: 'left',
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error details
              </summary>
              <code style={{
                display: 'block',
                whiteSpace: 'pre-wrap',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </code>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              fontSize: '16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

