import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Bell, Lock, CreditCard, Shield, Globe, HelpCircle, HeartPulse, FileUp } from 'lucide-react';

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
    {
      title: 'Medical Context',
      icon: HeartPulse,
      description: 'Add confirmed medical information to personalize insights',
      path: '/settings/medical-context',
    },
    {
      title: 'Document Intake & Review',
      icon: FileUp,
      description: 'Upload medical documents and review candidate facts before activation',
      path: '/settings/document-intake',
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-lg">
        <div className="max-w-4xl mx-auto">
          <div className="mb-lg">
            <h1 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text mb-1">Settings</h1>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Manage your account and preferences</p>
          </div>

          <div className="space-y-4 mb-lg">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-brand-500/10 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand-500 dark:text-brand-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body-md font-semibold text-neutral-text dark:text-dark-text mb-0.5">
                          {section.title}
                        </h3>
                        <p className="text-body-sm text-neutral-muted dark:text-dark-muted">{section.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 flex-shrink-0"
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
              <div className="flex-shrink-0 w-9 h-9 bg-brand-500/10 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-brand-500 dark:text-brand-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">Need Help?</h3>
                <p className="text-body-xs text-neutral-muted dark:text-dark-muted">
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

          <div className="mt-lg pt-lg border-t border-neutral-border dark:border-dark-border">
            <h3 className="text-body-md font-semibold text-neutral-text dark:text-dark-text mb-md">Account Actions</h3>
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
