import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center px-md py-xl">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-xl">
          <Activity className="h-8 w-8 text-brand-500" />
          <span className="text-h4 font-sora font-semibold text-neutral-text">GutWise</span>
        </Link>

        <Card variant="elevated">
          <div className="text-center mb-lg">
            <h1 className="text-h3 font-sora font-semibold text-neutral-text mb-2">Create Your Account</h1>
            <p className="text-body-md text-neutral-muted">Your gut health data belongs to you. Let us help you understand it.</p>
          </div>

          {error && (
            <div className="mb-md p-3 bg-signal-100 border border-signal-300 rounded-lg text-body-sm text-signal-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label htmlFor="name" className="block text-label font-medium text-neutral-text mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-base pl-10"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-label font-medium text-neutral-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
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
              <label htmlFor="password" className="block text-label font-medium text-neutral-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-base pl-10"
                  placeholder="Create a strong password"
                />
              </div>
              <p className="mt-2 text-body-sm text-neutral-muted">
                Must be at least 8 characters with a mix of letters and numbers
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-neutral-border rounded"
                />
              </div>
              <div className="ml-3 text-body-sm">
                <label htmlFor="terms" className="text-neutral-text">
                  I agree to the{' '}
                  <Link to="/privacy" className="font-medium text-brand-500 hover:text-brand-700 transition-colors">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/disclaimer" className="font-medium text-brand-500 hover:text-brand-700 transition-colors">
                    Medical Disclaimer
                  </Link>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-lg text-center">
            <p className="text-body-sm text-neutral-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand-500 hover:text-brand-700 transition-colors">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-lg pt-lg border-t border-neutral-border">
            <div className="flex items-center justify-center gap-2 text-body-sm text-neutral-muted">
              <Lock className="h-4 w-4" />
              <span>Your data is encrypted and HIPAA compliant</span>
            </div>
          </div>
        </Card>

        <div className="mt-xl bg-brand-100 border border-brand-300 rounded-lg p-md">
          <p className="text-body-sm text-brand-900 text-center">
            <strong>Free 14-day trial</strong> - No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
