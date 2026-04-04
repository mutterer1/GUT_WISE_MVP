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

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="space-y-4 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{section.description}</p>
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

          <Card>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our support team is here to assist you with any questions or concerns
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Card padding="md" className="border-yellow-200 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">Pause Your Account</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Temporarily disable your account without losing data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                    Pause
                  </Button>
                </div>
              </Card>

              <Card padding="md" className="border-red-200 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Delete Account</p>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
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
