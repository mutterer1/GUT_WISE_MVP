import { useEffect, useRef, useState } from 'react';
import {
  searchMedicationSuggestionsWithFallback,
  type MedicationReferenceSuggestion,
} from '../services/referenceSearchService';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: MedicationReferenceSuggestion) => void;
}

export default function MedicationAutocompleteInput({
  id,
  value,
  onChange,
  onSelect,
}: Props) {
  const [suggestions, setSuggestions] = useState<MedicationReferenceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        if (!cancelled) {
          setSuggestions([]);
          setOpen(false);
          setActiveIndex(-1);
        }
        return;
      }

      const results = await searchMedicationSuggestionsWithFallback(trimmed);
      if (cancelled) return;

      setSuggestions(results);
      setOpen(results.length > 0);
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

  function handleSelect(suggestion: MedicationReferenceSuggestion) {
    onSelect(suggestion);
    setOpen(false);
    setSuggestions([]);
  }

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
      }
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length >= 2) {
            setOpen(true);
          }
        }}
        placeholder="e.g. Omeprazole, Pepcid, Metformin..."
        autoComplete="off"
        className="input-base w-full"
        required
      />

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-[220] mt-2 overflow-hidden rounded-[22px]"
          style={{
            background: 'rgba(11, 18, 32, 0.98)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.42), 0 4px 10px rgba(0,0,0,0.28)',
            maxHeight: '280px',
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
              className={[
                'w-full px-4 py-3 text-left transition-colors',
                index === activeIndex ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-white/92">
                  {suggestion.name}
                </span>
                {suggestion.route && (
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-white/50">
                    {suggestion.route}
                  </span>
                )}
              </div>

              {(suggestion.genericName || suggestion.detail) && (
                <div className="mt-1 text-xs text-white/45">
                  {[suggestion.genericName, suggestion.detail]
                    .filter((part): part is string => Boolean(part && part.trim().length > 0))
                    .join(' | ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}