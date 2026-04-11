import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

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
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-lg">
        <div className="max-w-2xl mx-auto">
          <div className="mb-lg">
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center gap-1.5 text-body-sm text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text mb-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </button>
            <h1 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text mb-1">{title}</h1>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">{description}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
