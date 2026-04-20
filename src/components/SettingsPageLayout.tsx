import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

interface SettingsPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function SettingsPageLayout({
  title,
  description,
  children,
}: SettingsPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <main className="page-shell">
      <div className="page-wrap py-6 lg:py-8">
        <div className="mx-auto w-full max-w-4xl">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>

          <section className="surface-panel page-enter rounded-[32px] px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="page-header mb-8 items-start justify-between gap-5">
              <div className="max-w-2xl">
                <span className="badge-secondary mb-3 inline-flex">Account Controls</span>
                <h1 className="page-title">{title}</h1>
                <p className="page-subtitle mt-2">{description}</p>
              </div>

              <div className="surface-panel-soft hidden min-w-[220px] rounded-3xl px-4 py-4 lg:block">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(109,168,255,0.14)] text-[var(--color-accent-primary)]">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Private account settings
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                  Update access, preferences, and profile controls in one focused workspace.
                </p>
              </div>
            </div>

            <div className="space-y-5">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
