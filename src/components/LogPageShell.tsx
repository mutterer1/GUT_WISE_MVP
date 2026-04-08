import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Clock } from 'lucide-react';
import Sidebar from './Sidebar';
import Button from './Button';
import SuccessToast from './SuccessToast';

interface LogPageShellProps {
  title: string;
  subtitle: string;
  message: string;
  toastVisible: boolean;
  onDismissToast: () => void;
  error: string;
  showHistory?: boolean;
  onShowHistory?: (v: boolean) => void;
  editingId?: string | null;
  children: React.ReactNode;
}

export default function LogPageShell({
  title,
  subtitle,
  message,
  toastVisible,
  onDismissToast,
  error,
  showHistory,
  onShowHistory,
  editingId,
  children,
}: LogPageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pt-24 sm:pt-24 lg:pt-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>

          <SuccessToast message={message} visible={toastVisible} onDismiss={onDismissToast} />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {onShowHistory && (
            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => onShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                {editingId ? 'Edit Entry' : 'New Entry'}
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => onShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
