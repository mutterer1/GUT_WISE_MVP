import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Bell, Lock, CreditCard, Shield, Globe, HelpCircle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information and profile details',
      path: '/settings/profile',
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Control how and when you receive updates',
      path: '/settings/notifications',
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      description: 'Manage your data privacy and security settings',
      path: '/settings/privacy-security',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      description: 'View and manage your subscription and payment methods',
      path: '/settings/billing',
    },
    {
      title: 'Data Management',
      icon: Shield,
      description: 'Export, backup, or delete your health data',
      path: '/settings/data-management',
    },
    {
      title: 'Preferences',
      icon: Globe,
      description: 'Customize your experience and app preferences',
      path: '/settings/preferences',
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-20 sm:pt-20 lg:pt-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 pt-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
          </div>

          <div className="space-y-4 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{section.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => navigate(section.path)}
                    >
                      Configure
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Need Help?</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Our support team is here to assist you with any questions or concerns
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/[0.08]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Card padding="md" className="border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">Pause Your Account</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Temporarily disable your account without losing data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                    Pause
                  </Button>
                </div>
              </Card>

              <Card padding="md" className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">Delete Account</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30">
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
