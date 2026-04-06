import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-dark-bg flex items-center justify-center px-md py-xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-xl group">
          <div className="relative">
            <Activity className="h-8 w-8 text-brand-500" />
            <div className="absolute inset-0 bg-discovery-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
            Gut<span className="text-brand-500">Wise</span>
          </span>
        </Link>

        <Card variant="glass" padding="lg">
          <div className="text-center mb-lg">
            <h1 className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text mb-2">Welcome Back</h1>
            <p className="text-body-md text-neutral-muted dark:text-dark-muted">Your insights are waiting for you.</p>
          </div>

          {error && (
            <div className="mb-md p-3 bg-signal-100 dark:bg-signal-900/20 border border-signal-300 dark:border-signal-700/30 rounded-lg text-body-sm text-signal-700 dark:text-signal-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            <div>
              <label htmlFor="email" className="block text-label font-medium text-neutral-text dark:text-dark-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted dark:text-dark-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-base pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-label font-medium text-neutral-text dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted dark:text-dark-muted" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-base pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-neutral-border dark:border-dark-border rounded bg-neutral-surface dark:bg-dark-surface"
                />
                <label htmlFor="remember-me" className="ml-2 block text-body-sm text-neutral-text dark:text-dark-text">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-body-sm font-medium text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-lg text-center">
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                Get started free
              </Link>
            </p>
          </div>

          <div className="mt-lg pt-lg border-t border-neutral-border dark:border-dark-border">
            <div className="flex items-center justify-center gap-2 text-body-sm text-neutral-muted dark:text-dark-muted">
              <Lock className="h-4 w-4 text-brand-500" />
              <span>Secure login protected by 256-bit encryption</span>
            </div>
          </div>
        </Card>

        <p className="mt-xl text-center text-body-sm text-neutral-muted dark:text-dark-muted">
          By logging in, you agree to our{' '}
          <Link to="/privacy" className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/disclaimer" className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
            Medical Disclaimer
          </Link>
        </p>
      </div>
    </div>
  );
}
