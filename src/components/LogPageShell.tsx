import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import SuccessToast from './SuccessToast';

interface LogPageShellProps {
  title: string;
  subtitle: string;
  message: string;
  toastVisible: boolean;
  onDismissToast: () => void;
  error: string;
  children: React.ReactNode;
}

export default function LogPageShell({
  title,
  subtitle,
  message,
  toastVisible,
  onDismissToast,
  error,
  children,
}: LogPageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-20 sm:pt-20 lg:pt-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-body-sm text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text mb-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div className="mb-lg">
            <h1 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {title}
            </h1>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted mt-1">
              {subtitle}
            </p>
          </div>

          <SuccessToast message={message} visible={toastVisible} onDismiss={onDismissToast} />

          {error && (
            <div className="mb-lg p-md bg-signal-500/10 border border-signal-500/30 rounded-xl text-body-sm text-signal-500">
              {error}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
