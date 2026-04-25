import type { ReactNode } from 'react';
import { Pencil, Search, Trash2, X } from 'lucide-react';

interface LogHistoryToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
  placeholder?: string;
}

export function LogHistoryToolbar({
  query,
  onQueryChange,
  totalCount,
  filteredCount,
  placeholder = 'Search history...',
}: LogHistoryToolbarProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
            History tools
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Showing {filteredCount} of {totalCount} saved entries
          </p>
        </div>

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)] sm:self-auto"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="input-base w-full pl-10"
        />
      </label>
    </div>
  );
}

interface LogHistoryGroupProps {
  label: string;
  count: number;
  children: ReactNode;
}

export function LogHistoryGroup({ label, count, children }: LogHistoryGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
          {label}
        </h3>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-tertiary)]">
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface LogHistoryActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function LogHistoryActions({ onEdit, onDelete }: LogHistoryActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(84,160,255,0.20)] bg-[rgba(84,160,255,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-primary)] transition-smooth hover:border-[rgba(84,160,255,0.34)] hover:bg-[rgba(84,160,255,0.12)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)] transition-smooth hover:border-[rgba(255,120,120,0.30)] hover:bg-[rgba(255,120,120,0.12)]"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}

interface LogHistoryNoMatchesProps {
  query: string;
  onClear: () => void;
}

export function LogHistoryNoMatches({ query, onClear }: LogHistoryNoMatchesProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-8 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">No matching entries</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
        No saved history matched "{query}". Clear the search to return to the full timeline.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)]"
      >
        Clear search
      </button>
    </div>
  );
}