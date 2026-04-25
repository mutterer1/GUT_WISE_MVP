import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CreditCard,
  FileUp,
  Globe,
  HeartPulse,
  HelpCircle,
  Lock,
  ShieldCheck,
  Shield,
  User,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information and profile details.',
      path: '/settings/profile',
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Control how and when you receive updates.',
      path: '/settings/notifications',
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      description: 'Manage your data privacy and security settings.',
      path: '/settings/privacy-security',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      description: 'View and manage your subscription and payment methods.',
      path: '/settings/billing',
    },
    {
      title: 'Data Management',
      icon: Shield,
      description: 'Export, back up, or delete your health data.',
      path: '/settings/data-management',
    },
    {
      title: 'Preferences',
      icon: Globe,
      description: 'Customize your experience and app behavior.',
      path: '/settings/preferences',
    },
    {
      title: 'Medical Context',
      icon: HeartPulse,
      description: 'Add confirmed medical information to personalize insights.',
      path: '/settings/medical-context',
    },
    {
      title: 'Document Intake & Review',
      icon: FileUp,
      description: 'Upload medical documents and review candidate facts before activation.',
      path: '/settings/document-intake',
    },
    {
      title: 'Reference Review Queue',
      icon: ShieldCheck,
      description: 'Review custom foods and medications before promoting them into the live reference library.',
      path: '/settings/reference-review',
    },
  ];

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="page-enter surface-panel rounded-[32px] p-5 sm:p-6 lg:p-8">
          <div className="page-header items-start justify-between gap-5">
            <div className="max-w-3xl">
              <span className="badge-secondary mb-3 inline-flex">Account Controls</span>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle mt-2">
                Manage your account, data handling, profile context, and product behavior from one
                focused control surface.
              </p>
            </div>

            <div className="surface-intelligence hidden min-w-[260px] rounded-[28px] p-4 lg:block">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.16)] text-[var(--color-accent-primary)]">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Private account operations
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                Sensitive controls stay grouped here so privacy, data, and medical context remain
                easy to audit.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const discovery =
              section.title === 'Medical Context' ||
              section.title === 'Document Intake & Review' ||
              section.title === 'Reference Review Queue';

            return (
              <Card
                key={section.title}
                variant={discovery ? 'discovery' : 'elevated'}
                glowIntensity={discovery ? 'medium' : 'subtle'}
                className="card-enter rounded-[28px]"
              >
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        discovery
                          ? 'bg-[rgba(133,93,255,0.14)] text-[var(--color-accent-secondary)]'
                          : 'bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                          {section.title}
                        </h3>
                        {index < 2 && <span className="badge-secondary">Core</span>}
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button
                      variant={discovery ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => navigate(section.path)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card variant="flat" className="rounded-[28px]">
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
                  <HelpCircle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                    Need Help?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Reach support or review guidance before changing sensitive settings.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">
                  Contact Support
                </Button>
                <Button variant="ghost" size="sm">
                  View Docs
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="rounded-[28px]">
            <div className="flex h-full flex-col gap-4">
              <span className="badge-secondary w-fit">Review First</span>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                High-impact changes
              </h3>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                Billing, privacy, and data-management changes have the biggest downstream effect on
                account behavior and records access.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="page-header">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Account Actions</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Irreversible and temporary account actions
              </h2>
              <p className="page-subtitle mt-2">
                Keep destructive actions separated from routine settings to reduce mistakes.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card variant="flat" className="rounded-[28px] border-[rgba(255,170,92,0.2)] bg-[rgba(255,170,92,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Pause Your Account
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Temporarily disable your account without losing historical data.
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="sm:shrink-0">
                  Pause
                </Button>
              </div>
            </Card>

            <Card variant="flat" className="rounded-[28px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Delete Account
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="sm:shrink-0 text-[var(--color-danger)]">
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
