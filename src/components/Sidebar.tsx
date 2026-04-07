import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Activity,
  TrendingUp,
  ChevronDown,
  Droplet,
  Utensils,
  AlertCircle,
  Moon,
  Pill,
  Heart,
  BookOpen,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Logging Hub', href: null, icon: BookOpen, submenu: true },
  { name: 'Health Insights', href: '/insights', icon: Brain },
  { name: 'Trends & Analytics', href: '/trends', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const loggingSubmenu = [
  { name: 'Bowel Movement', href: '/bm-log', icon: Activity },
  { name: 'Food Intake', href: '/food-log', icon: Utensils },
  { name: 'Symptoms', href: '/symptoms-log', icon: AlertCircle },
  { name: 'Sleep', href: '/sleep-log', icon: Moon },
  { name: 'Stress', href: '/stress-log', icon: Brain },
  { name: 'Hydration', href: '/hydration-log', icon: Droplet },
  { name: 'Menstrual Cycle', href: '/menstrual-cycle-log', icon: Heart },
  { name: 'Medication', href: '/medication-log', icon: Pill },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedLoggingHub, setExpandedLoggingHub] = useState(false);

  const location = useLocation();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const displayName =
    profile?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const userEmail = profile?.email || user?.email || '';

  const getInitial = () => {
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const isLoggingHubActive = loggingSubmenu.some((item) =>
    isActive(item.href)
  );

  useEffect(() => {
    if (isLoggingHubActive) {
      setExpandedLoggingHub(true);
    }
  }, [isLoggingHubActive]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-3 border-b border-neutral-border bg-neutral-surface px-4 lg:hidden dark:border-dark-border dark:bg-dark-bg">
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-neutral-bg dark:hover:bg-dark-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-neutral-text dark:text-dark-text" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-text dark:text-dark-text" />
          )}
        </button>
        <img
          src="/logos/gutwise-horizontal-dark.svg"
          alt="GutWise"
          style={{ height: '32px', width: 'auto' }}
        />
      </div>

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 border-r border-neutral-border bg-neutral-surface
          transition-transform duration-300 ease-in-out dark:border-dark-border dark:bg-dark-bg
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex items-center justify-center border-b border-neutral-border px-6 py-6 dark:border-dark-border">
            <img
              src="/logos/gutwise-horizontal-dark.svg"
              alt="GutWise"
              style={{ height: '72px', width: 'auto' }}
            />
            <button
              onClick={toggleTheme}
              className="absolute right-4 rounded-lg p-2 transition-colors hover:bg-neutral-bg dark:hover:bg-dark-surface"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-dark-muted" />
              ) : (
                <Moon className="h-5 w-5 text-neutral-muted" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isLoggingHub = item.name === 'Logging Hub';
              const active = item.href ? isActive(item.href) : false;
              const showLoggingHubActive = isLoggingHub && isLoggingHubActive;

              if (isLoggingHub) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setExpandedLoggingHub(!expandedLoggingHub)}
                      className={`
                        w-full rounded-lg px-4 py-3 text-sm font-medium
                        flex items-center gap-3 transition-colors duration-150
                        ${
                          showLoggingHubActive
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                            : 'text-neutral-text hover:bg-neutral-bg dark:text-dark-text dark:hover:bg-dark-surface'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedLoggingHub ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedLoggingHub && (
                      <div className="mt-1 ml-2 space-y-1 border-l border-neutral-border pl-2 dark:border-dark-border">
                        {loggingSubmenu.map((subitem) => {
                          const SubIcon = subitem.icon;
                          const subActive = isActive(subitem.href);

                          return (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              className={`
                                flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium
                                transition-colors duration-150
                                ${
                                  subActive
                                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                    : 'text-neutral-muted hover:bg-neutral-bg hover:text-neutral-text dark:text-dark-muted dark:hover:bg-dark-surface dark:hover:text-dark-text'
                                }
                              `}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="text-xs">{subitem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                    transition-colors duration-150
                    ${
                      active
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-neutral-text hover:bg-neutral-bg dark:text-dark-text dark:hover:bg-dark-surface'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-neutral-border px-6 py-4 dark:border-dark-border">
            <Link
              to="/account"
              className="flex items-center gap-3 rounded-lg px-2 transition-colors duration-150 hover:bg-neutral-bg dark:hover:bg-dark-surface"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white">
                {getInitial()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-text dark:text-dark-text">
                  {displayName}
                </p>
                <p className="truncate text-xs text-neutral-muted dark:text-dark-muted">{userEmail}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
