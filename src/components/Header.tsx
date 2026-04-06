import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-neutral-surface/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-neutral-border dark:border-dark-border z-20">
      <nav className="max-w-7xl mx-auto px-md sm:px-lg lg:px-lg" aria-label="Top navigation">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Activity className="h-8 w-8 text-brand-500" />
              <div className="absolute inset-0 bg-discovery-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
              Gut<span className="text-brand-500">Wise</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-md">
            <Link
              to="/login"
              className="text-body-md font-medium text-neutral-text dark:text-dark-text hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-md py-2 text-body-md font-medium text-white bg-brand-500 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
