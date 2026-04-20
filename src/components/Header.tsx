import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from './Button';

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-[rgba(8,12,20,0.86)] backdrop-blur-xl">
      <nav
        className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Top navigation"
      >
        <Link to="/" className="flex items-center" aria-label="GutWise home">
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            className="block h-[58px] w-auto sm:h-[64px]"
          />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="min-w-[92px]">
              Log in
            </Button>
          </Link>

          <Link to="/signup">
            <Button variant="primary" size="sm" className="min-w-[148px]">
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
