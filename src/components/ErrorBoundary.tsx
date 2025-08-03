'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Solana wallet hatalarını sessizce yakala
    if (error.message?.includes('WalletDisconnectedError') || 
        error.message?.includes('solana') ||
        error.stack?.includes('chrome-extension://')) {
      console.warn('Wallet extension error caught and suppressed:', error.message);
      return { hasError: false }; // Hatayı gösterme, devam et
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Solana wallet hatalarını log'la ama UI'yi bozma
    if (error.message?.includes('WalletDisconnectedError') || 
        error.message?.includes('solana') ||
        error.stack?.includes('chrome-extension://')) {
      console.warn('Wallet extension error suppressed:', error, errorInfo);
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent 
            error={this.state.error} 
            reset={() => this.setState({ hasError: false, error: undefined })} 
          />
        );
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg border border-border p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wallet hatalarını yakalamak için özel hook
export const useWalletErrorSuppression = () => {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check for wallet extension errors
      if (event.error?.message?.includes('WalletDisconnectedError') ||
          event.error?.message?.includes('solana') ||
          event.error?.message?.includes('ethereum') ||
          event.error?.message?.includes('Cannot redefine property') ||
          event.error?.stack?.includes('chrome-extension://') ||
          event.filename?.includes('chrome-extension://')) {
        console.warn('🔇 Wallet extension error suppressed:', event.error?.message || event.message);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('WalletDisconnectedError') ||
          event.reason?.message?.includes('solana') ||
          event.reason?.message?.includes('ethereum') ||
          event.reason?.message?.includes('Cannot redefine property') ||
          event.reason?.stack?.includes('chrome-extension://')) {
        console.warn('🔇 Wallet extension promise rejection suppressed:', event.reason?.message);
        event.preventDefault();
        return false;
      }
    };

    // Also suppress console errors from wallet extensions
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args.join(' ');
      if (message.includes('chrome-extension://') ||
          message.includes('ethereum') ||
          message.includes('solana') ||
          message.includes('Pocket Universe') ||
          message.includes('Cannot redefine property')) {
        console.warn('🔇 Console error suppressed:', message);
        return;
      }
      originalConsoleError.apply(console, args as any[]);
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      console.error = originalConsoleError;
    };
  }, []);
};