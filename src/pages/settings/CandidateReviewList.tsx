import { useState } from 'react';
import { Check, X, Clock, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getCategoryConfig } from './medicalContextFields';
import type { CandidateMedicalFactRow, CandidateReviewStatus } from '../../types/medicalContext';

interface CandidateReviewListProps {
  candidates: CandidateMedicalFactRow[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  processing: string | null;
}

const STATUS_LABELS: Record<CandidateReviewStatus, { label: string; className: string }> = {
  pending_review: { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  accepted: { label: 'Accepted', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  rejected: { label: 'Rejected', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  merged: { label: 'Merged', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
};

export default function CandidateReviewList({
  candidates,
  onAccept,
  onReject,
  processing,
}: CandidateReviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (candidates.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-2">
          <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No candidate facts to review. Upload a document or manually seed candidates from an intake record.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {candidates.map((c) => {
        const config = getCategoryConfig(c.category);
        const displayValue = (c.detail as Record<string, string>)[config.displayField] || 'Unnamed';
        const isPending = c.review_status === 'pending_review';
        const isExpanded = expandedId === c.id;
        const isProcessing = processing === c.id;
        const statusInfo = STATUS_LABELS[c.review_status];

        return (
          <Card key={c.id} padding="none">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="flex items-start gap-3 text-left flex-1 min-w-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {displayValue}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {config.label} &middot; Source: {c.extraction_source.replace(/_/g, ' ')}
                    </p>
                  </div>
                </button>

                {isPending && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAccept(c.id)}
                      disabled={isProcessing}
                      className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReject(c.id)}
                      disabled={isProcessing}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {config.fields.map((field) => {
                      const val = (c.detail as Record<string, unknown>)[field.key];
                      if (val === null || val === undefined || val === '') return null;
                      const display = Array.isArray(val) ? val.join(', ') : String(val);
                      return (
                        <div key={field.key}>
                          <dt className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {field.label}
                          </dt>
                          <dd className="text-sm text-gray-900 dark:text-white mt-0.5">
                            {field.type === 'boolean' ? (val ? 'Yes' : 'No') : display}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>

                  {c.extraction_notes && (
                    <div className="mt-3 flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.extraction_notes}</p>
                    </div>
                  )}

                  {c.reviewed_at && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                      Reviewed {new Date(c.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
