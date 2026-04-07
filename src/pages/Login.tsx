import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#0F172A' }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(74,143,168,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(74,143,168,0.06) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex justify-center mb-8">
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            style={{ height: '90px', width: 'auto', mixBlendMode: 'screen' }}
          />
        </Link>

        <div
          className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: 'Sora, sans-serif', color: '#F1F5F9', letterSpacing: '-0.02em' }}
            >
              Welcome Back
            </h1>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              Your insights are waiting for you.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3 text-sm"
              style={{
                background: 'rgba(194,143,148,0.12)',
                border: '1px solid rgba(194,143,148,0.30)',
                color: '#F4B8BC',
              }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: '#C28F94' }}>&#9888;</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#CBD5E1' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 pointer-events-none"
                  style={{ color: '#64748B', width: 18, height: 18 }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-base transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#F1F5F9',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #4A8FA8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,143,168,0.18)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#CBD5E1' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#64748B', width: 18, height: 18 }}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-base transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#F1F5F9',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #4A8FA8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,143,168,0.18)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff style={{ width: 18, height: 18 }} />
                    : <Eye style={{ width: 18, height: 18 }} />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="rounded"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#4A8FA8',
                  }}
                />
                <span className="text-sm" style={{ color: '#94A3B8' }}>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium transition-colors duration-150"
                style={{ color: '#4A8FA8' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8EBFD8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4A8FA8'; }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 mt-2 relative overflow-hidden"
              style={{
                background: loading ? '#2C617D' : 'linear-gradient(135deg, #4A8FA8 0%, #2C617D 100%)',
                color: '#FFFFFF',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(74,143,168,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(74,143,168,0.45)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(74,143,168,0.35)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
                  />
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#64748B' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold transition-colors duration-150"
                style={{ color: '#4A8FA8' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8EBFD8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4A8FA8'; }}
              >
                Get started free
              </Link>
            </p>
          </div>

          <div
            className="mt-6 pt-6 flex items-center justify-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <ShieldCheck style={{ width: 15, height: 15, color: '#4A8FA8' }} />
            <span className="text-xs" style={{ color: '#475569' }}>
              Secure login protected by 256-bit encryption
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#475569' }}>
          By logging in, you agree to our{' '}
          <Link
            to="/privacy"
            className="transition-colors duration-150"
            style={{ color: '#4A8FA8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8EBFD8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4A8FA8'; }}
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            to="/disclaimer"
            className="transition-colors duration-150"
            style={{ color: '#4A8FA8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8EBFD8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4A8FA8'; }}
          >
            Medical Disclaimer
          </Link>
        </p>
      </div>
    </div>
  );
}
