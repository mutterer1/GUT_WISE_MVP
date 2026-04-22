import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (_theme: Theme | 'light') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'gutwise-theme';
const APP_PREFERENCES_KEY = 'app-preferences';

function enforceDarkTheme() {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  root.classList.add('dark');
  root.style.colorScheme = 'dark';

  localStorage.setItem(THEME_KEY, 'dark');

  const rawPreferences = localStorage.getItem(APP_PREFERENCES_KEY);
  if (!rawPreferences) return;

  try {
    const parsed = JSON.parse(rawPreferences) as Record<string, unknown>;
    localStorage.setItem(
      APP_PREFERENCES_KEY,
      JSON.stringify({
        ...parsed,
        theme: 'dark',
      })
    );
  } catch {
    localStorage.setItem(
      APP_PREFERENCES_KEY,
      JSON.stringify({
        theme: 'dark',
      })
    );
  }
}

function getInitialTheme(): Theme {
  enforceDarkTheme();
  return 'dark';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    enforceDarkTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    localStorage.setItem(THEME_KEY, 'dark');
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: 'dark',
      toggleTheme: () => {
        enforceDarkTheme();
      },
      setTheme: () => {
        enforceDarkTheme();
      },
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
