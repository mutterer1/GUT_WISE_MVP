import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SuccessToast from './SuccessToast';
import QuickLogLauncher from './QuickLogLauncher';

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
    <>
      <main className="page-shell">
        <div className="page-wrap py-4 sm:py-5 lg:py-8">
          <div className="mx-auto w-full max-w-3xl">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)] sm:mb-6 sm:px-3.5 sm:text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>

            <section className="surface-panel page-enter rounded-[28px] px-4 py-4 sm:rounded-[32px] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="page-header mb-5 sm:mb-6">
                <div>
                  <span className="badge-secondary mb-2 inline-flex sm:mb-3">Structured Entry</span>
                  <h1 className="page-title">{title}</h1>
                  <p className="page-subtitle mt-2 max-w-2xl">{subtitle}</p>
                </div>
              </div>

              <div className="mb-4 sm:mb-5">
                <SuccessToast message={message} visible={toastVisible} onDismiss={onDismissToast} />
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] px-4 py-3 text-sm text-[var(--color-danger)] sm:mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4 sm:space-y-5">{children}</div>
            </section>
          </div>
        </div>
      </main>
      <QuickLogLauncher />
    </>
  );
}
