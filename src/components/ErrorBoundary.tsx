import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const SUPABASE_TRACE_PATTERN = /[a-f0-9]{32}:[A-Za-z0-9+/]{16}:\d+:\d+/;

function getSafeErrorMessage(error: Error | null): string {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message ?? '';
  if (SUPABASE_TRACE_PATTERN.test(msg)) {
    return 'A temporary server error occurred. Please try again.';
  }
  if (msg.length > 200) {
    return 'An unexpected error occurred. Please reload and try again.';
  }
  return msg || 'An unexpected error occurred.';
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('App render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-6">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-h3 font-sora font-semibold text-dark-text">Something went wrong</h1>
            <p className="text-body-sm text-dark-muted">{getSafeErrorMessage(this.state.error)}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-700 text-white rounded-lg text-body-sm font-medium transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
