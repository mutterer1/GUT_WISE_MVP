import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from './Button';
import { LogoFull } from './Logo';

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[rgba(7,11,18,0.72)] backdrop-blur-xl">
      <nav
        className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Top navigation"
      >
        <Link to="/" className="flex items-center text-[var(--color-text-primary)]">
          <LogoFull />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="min-w-[92px]">
              Log in
            </Button>
          </Link>

          <Link to="/signup">
            <Button variant="primary" size="sm" className="min-w-[132px]">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
