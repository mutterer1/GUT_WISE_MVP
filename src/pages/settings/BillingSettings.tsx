import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function BillingSettings() {
  return (
    <SettingsPageLayout
      title="Billing & Subscription"
      description="Review your plan, payment state, and upgrade paths without mixing billing with the rest of account settings."
    >
      <div className="space-y-5">
        <Card variant="discovery" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Current Plan</h3>

          <div className="mt-5 rounded-[24px] border border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.08)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">Free Plan</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Limited access to tracking features.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--color-accent-primary)]" />
                <span className="text-sm font-medium text-[var(--color-accent-primary)]">Active</span>
              </div>
            </div>

            <div className="mt-4 border-t border-[rgba(84,160,255,0.16)] pt-4">
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                $0.00
                <span className="ml-1 text-sm font-medium text-[var(--color-text-tertiary)]">
                  /month
                </span>
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                No billing information required.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Upgrade Options</h3>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="surface-panel-quiet rounded-[24px] p-5 transition-smooth hover:bg-white/[0.05]">
              <p className="text-base font-semibold text-[var(--color-text-primary)]">Pro Plan</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                $9.99
                <span className="ml-1 text-sm font-medium text-[var(--color-text-tertiary)]">
                  /month
                </span>
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-primary)]" />
                  Unlimited logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-primary)]" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-primary)]" />
                  Priority support
                </li>
              </ul>

              <Button className="mt-5 w-full" variant="secondary">
                Upgrade Now
              </Button>
            </div>

            <div className="surface-intelligence rounded-[24px] p-5 transition-smooth hover:bg-[rgba(133,93,255,0.12)]">
              <p className="text-base font-semibold text-[var(--color-text-primary)]">Premium Plan</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                $19.99
                <span className="ml-1 text-sm font-medium text-[var(--color-text-tertiary)]">
                  /month
                </span>
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                  AI-powered insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                  Integration with health apps
                </li>
              </ul>

              <Button className="mt-5 w-full" variant="primary">
                Upgrade Now
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Payment Methods</h3>

          <div className="surface-panel-quiet mt-5 rounded-[24px] p-8 text-center">
            <CreditCard className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-tertiary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">No payment method on file</p>
            <Button variant="secondary" className="mt-4">
              Add Payment Method
            </Button>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Billing History</h3>

          <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/8 bg-white/[0.03]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-tertiary)]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-tertiary)]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-tertiary)]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-tertiary)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-white/[0.04]">
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">-</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                    No billing history
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">-</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[24px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Have questions about billing?
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Contact support for assistance with subscriptions, invoices, or refunds.
              </p>
              <Button variant="secondary" size="sm" className="mt-3">
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SettingsPageLayout>
  );
}
