import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-neutral-surface border-b border-neutral-border z-20 lg:static">
      <nav className="max-w-7xl mx-auto px-md sm:px-lg lg:px-lg" aria-label="Top navigation">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-brand-500" />
            <span className="text-h5 font-sora font-semibold text-neutral-text">GutWise</span>
          </Link>

          <div className="hidden md:flex items-center gap-md">
            <Link
              to="/login"
              className="text-body-md font-medium text-neutral-text hover:text-brand-500 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-md py-2 text-body-md font-medium text-white bg-brand-500 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
