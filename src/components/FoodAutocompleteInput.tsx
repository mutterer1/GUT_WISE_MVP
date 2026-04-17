import { useState, useRef, useEffect } from 'react';
import { searchFoodSuggestions, type FoodSuggestion } from '../data/foodSuggestions';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: FoodSuggestion) => void;
  onSubmit: () => void;
}

export default function FoodAutocompleteInput({ value, onChange, onSelect, onSubmit }: Props) {
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const results = searchFoodSuggestions(value);
    setSuggestions(results);
    setOpen(results.length > 0 && value.trim().length > 0);
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        setOpen(false);
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleSelect(suggestion: FoodSuggestion) {
    onSelect(suggestion);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length > 0) setOpen(true);
        }}
        placeholder="Add food item..."
        autoComplete="off"
        className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                i === activeIndex
                  ? 'bg-brand-500/10 dark:bg-brand-500/10'
                  : 'hover:bg-neutral-bg dark:hover:bg-dark-bg'
              }`}
            >
              <span className="text-body-sm text-neutral-text dark:text-dark-text font-medium">
                {s.name}
              </span>
              <span className="text-xs text-neutral-muted dark:text-dark-muted ml-3 shrink-0">
                ~{s.calories} cal &middot; {s.portionLabel}
              </span>
            </button>
          ))}
          {value.trim().length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onSubmit();
              }}
              className="w-full flex items-center px-4 py-2.5 text-left border-t border-neutral-border dark:border-dark-border hover:bg-neutral-bg dark:hover:bg-dark-bg transition-colors"
            >
              <span className="text-body-sm text-neutral-muted dark:text-dark-muted">
                Add &ldquo;{value.trim()}&rdquo; as custom food
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
