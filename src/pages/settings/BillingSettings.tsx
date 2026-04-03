import { CreditCard, CheckCircle, AlertCircle, Download } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function BillingSettings() {
  return (
    <SettingsPageLayout
      title="Billing & Subscription"
      description="View and manage your subscription and payment methods"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
          <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900 text-lg">Free Plan</p>
                <p className="text-sm text-gray-600 mt-1">Limited access to tracking features</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-teal-200">
              <p className="text-2xl font-bold text-gray-900">$0.00<span className="text-sm text-gray-600">/month</span></p>
              <p className="text-xs text-gray-600 mt-2">No billing information required</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors">
              <p className="font-medium text-gray-900">Pro Plan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$9.99<span className="text-sm text-gray-600">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Unlimited logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Upgrade Now
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors">
              <p className="font-medium text-gray-900">Premium Plan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$19.99<span className="text-sm text-gray-600">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  AI-powered insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Integration with health apps
                </li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Upgrade Now
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">No payment method on file</p>
            <Button variant="outline">
              Add Payment Method
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">-</td>
                  <td className="py-3 px-4 text-sm text-gray-600">No billing history</td>
                  <td className="py-3 px-4 text-sm text-gray-600">-</td>
                  <td className="py-3 px-4 text-sm text-gray-600">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Have questions about billing?
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Contact our support team for assistance with subscriptions, invoices, or refunds
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SettingsPageLayout>
  );
}
