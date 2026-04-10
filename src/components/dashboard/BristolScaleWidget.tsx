import { Droplets } from 'lucide-react';
import Card from '../Card';

interface BristolScaleWidgetProps {
  averageScale: number | null;
  count: number;
  loading: boolean;
}

export default function BristolScaleWidget({
  averageScale,
  count,
  loading,
}: BristolScaleWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-32"></div>
              <div className="h-9 bg-neutral-border dark:bg-dark-border rounded w-14"></div>
            </div>
            <div className="w-11 h-11 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
          <div className="h-14 bg-neutral-border dark:bg-dark-border rounded-xl mb-3"></div>
          <div className="h-10 bg-neutral-border dark:bg-dark-border rounded-xl mb-3"></div>
          <div className="h-8 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
        </div>
      </Card>
    );
  }

  const getBristolInfo = (scale: number) => {
    const info = {
      1: { type: 'Type 1', desc: 'Hard lumps', color: 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500', status: 'Constipation' },
      2: { type: 'Type 2', desc: 'Lumpy sausage', color: 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500', status: 'Mild constipation' },
      3: { type: 'Type 3', desc: 'Cracked sausage', color: 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-500', status: 'Normal' },
      4: { type: 'Type 4', desc: 'Smooth snake', color: 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-500', status: 'Ideal' },
      5: { type: 'Type 5', desc: 'Soft blobs', color: 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-500', status: 'Normal' },
      6: { type: 'Type 6', desc: 'Mushy pieces', color: 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500', status: 'Mild diarrhea' },
      7: { type: 'Type 7', desc: 'Liquid', color: 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500', status: 'Diarrhea' },
    };

    const rounded = Math.round(scale);
    return info[rounded as keyof typeof info] || info[4];
  };

  if (count === 0 || averageScale === null) {
    return (
      <Card variant="elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1.5 uppercase tracking-wide">
              Average Stool Type
            </p>
            <p className="text-display-md font-sora font-semibold text-neutral-muted dark:text-dark-muted">—</p>
          </div>
          <div className="w-11 h-11 bg-neutral-bg dark:bg-dark-surface rounded-xl flex items-center justify-center">
            <Droplets className="h-5 w-5 text-neutral-muted dark:text-dark-muted" />
          </div>
        </div>
        <div className="bg-neutral-bg dark:bg-dark-surface px-4 py-3 rounded-xl">
          <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
            No BM data logged yet today
          </p>
        </div>
      </Card>
    );
  }

  const bristolInfo = getBristolInfo(averageScale);
  const roundedScale = Math.round(averageScale * 10) / 10;

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1.5 uppercase tracking-wide">
            Average Stool Type
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">{roundedScale}</p>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">/ 7</p>
          </div>
        </div>
        <div className="w-11 h-11 bg-signal-500/10 dark:bg-signal-500/15 rounded-xl flex items-center justify-center">
          <Droplets className="h-5 w-5 text-signal-500" />
        </div>
      </div>

      <div className={`${bristolInfo.color} px-3 py-2.5 rounded-xl mb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm font-semibold">{bristolInfo.type} · {bristolInfo.desc}</p>
            <p className="text-xs mt-0.5 opacity-70">Status: {bristolInfo.status}</p>
          </div>
          <span className="text-xs opacity-60">{count} {count === 1 ? 'entry' : 'entries'}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-neutral-muted dark:text-dark-muted">Constipation</span>
          <span className="text-xs text-brand-500 font-medium">Ideal</span>
          <span className="text-xs text-neutral-muted dark:text-dark-muted">Diarrhea</span>
        </div>
        <div className="h-2 bg-gradient-to-r from-signal-500/40 via-brand-500/50 to-signal-500/40 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-text dark:bg-dark-text rounded-full border-2 border-neutral-surface dark:border-dark-bg shadow-md"
            style={{ left: `calc(${((averageScale - 1) / 6) * 100}% - 6px)` }}
          />
        </div>
      </div>
    </Card>
  );
}
