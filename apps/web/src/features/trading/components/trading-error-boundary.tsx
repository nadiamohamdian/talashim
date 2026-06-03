'use client';

import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { Alert, Button } from '@talashim/ui';

interface Props extends PropsWithChildren {
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class TradingErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TradingErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="mx-auto max-w-lg">
          <p className="font-semibold">{this.props.fallbackTitle ?? 'خطا در بارگذاری داشبورد'}</p>
          <p className="mt-1 text-xs opacity-90">{this.state.message}</p>
          <Button variant="outline" className="mt-4" onClick={this.handleReset}>
            تلاش مجدد
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
