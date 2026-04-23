import { useEffect, useRef, useState } from 'react';
import {
  searchFoodSuggestionsWithFallback,
  type FoodReferenceSuggestion,
} from '../services/referenceSearchService';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: FoodReferenceSuggestion) => void;
  onSubmit: () => void;
}

export default function FoodAutocompleteInput({
  value,
  onChange,
  onSelect,
  onSubmit,
}: Props) {
  const [suggestions, setSuggestions] = useState<FoodReferenceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const results = await searchFoodSuggestionsWithFallback(value);
      if (cancelled) return;

      setSuggestions(results);
      setOpen(results.length > 0 && value.trim().length > 1);
      setActiveIndex(-1);
    }

    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        setOpen(false);
        onSubmit();
      }
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleSelect(suggestion: FoodReferenceSuggestion) {
    onSelect(suggestion);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length > 0) {
            setOpen(true);
          }
        }}
        placeholder="Add food item..."
        autoComplete="off"
        className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface px-4 py-2.5 text-body-sm text-neutral-text placeholder:text-neutral-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:placeholder:text-dark-muted/50"
      />

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-[200] mt-1.5 overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(15, 23, 42, 0.97)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                index === activeIndex ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <span className="truncate text-sm font-medium text-white/90">
                {suggestion.name}
              </span>
              {(suggestion.estimatedCalories || suggestion.portionLabel || suggestion.detail) && (
                <span className="ml-3 shrink-0 text-xs text-white/40 tabular-nums">
                  {suggestion.estimatedCalories
                    ? `~${suggestion.estimatedCalories} cal`
                    : suggestion.detail}
                  {suggestion.estimatedCalories && suggestion.portionLabel ? ' | ' : ''}
                  {!suggestion.estimatedCalories &&
                  suggestion.detail &&
                  suggestion.portionLabel
                    ? ' | '
                    : ''}
                  {suggestion.portionLabel ?? ''}
                </span>
              )}
            </button>
          ))}

          {value.trim().length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                setOpen(false);
                onSubmit();
              }}
              className="w-full flex items-center px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-sm text-white/40">
                Add &ldquo;{value.trim()}&rdquo; as custom food
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
