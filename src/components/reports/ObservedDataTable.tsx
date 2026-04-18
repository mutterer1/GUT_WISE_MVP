interface ObservedDataRow {
  label: string;
  value: string;
  note?: string;
}
interface ObservedDataTableProps {
  rows: ObservedDataRow[];
  title?: string;
  subtitle?: string;
}
export default function ObservedDataTable({
  rows,
  title = 'Observed Data Summary',
  subtitle = 'A compact summary of the patient-reported data included in this report.',
}: ObservedDataTableProps) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Observed Data Summary
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.08]">
        <div className="grid grid-cols-[1.3fr_0.8fr_1fr] bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
          <div>Metric</div>
          <div>Value</div>
          <div>Note</div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {rows.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              className="grid grid-cols-[1.3fr_0.8fr_1fr] px-4 py-3 text-sm"
            >
              <div className="pr-3 font-medium text-gray-900 dark:text-white">{row.label}</div>
              <div className="pr-3 text-gray-900 dark:text-white">{row.value}</div>
              <div className="text-gray-500 dark:text-gray-400">{row.note ?? '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
