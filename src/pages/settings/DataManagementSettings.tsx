import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  Trash2,
  Upload,
  X,
  ShieldCheck,
  Archive,
  AlertTriangle,
  Database,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const EXPORT_TABLES = [
  'profiles',
  'bm_logs',
  'food_logs',
  'symptom_logs',
  'sleep_logs',
  'stress_logs',
  'hydration_logs',
  'medication_logs',
  'menstrual_cycle_logs',
] as const;

type ExportFormat = 'docx' | 'json';
type ExportPayload = Record<string, unknown> & {
  exportDate: string;
  userId: string;
};

export default function DataManagementSettings() {
  const { user } = useAuth();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [exportMessage, setExportMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExport = async (format: ExportFormat) => {
    if (!user?.id) return;

    setExportingFormat(format);
    setExportMessage('');

    try {
      const payload = await fetchExportPayload(user.id);

      if (format === 'docx') {
        downloadBlob(
          new Blob([createDocxDocument(payload)], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }),
          `gutwise-export-${new Date().toISOString().split('T')[0]}.docx`
        );
        setExportMessage('Your readable DOCX export is ready and has been downloaded.');
      } else {
        downloadBlob(
          new Blob([JSON.stringify(payload, null, 2)], {
            type: 'application/json',
          }),
          `gutwise-export-${new Date().toISOString().split('T')[0]}.json`
        );
        setExportMessage('Your raw JSON export is ready and has been downloaded.');
      }

      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setExportMessage('');
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user?.id) return;

    setDeleteError('');

    try {
      const tables = [
        'bm_logs',
        'food_logs',
        'symptom_logs',
        'sleep_logs',
        'stress_logs',
        'hydration_logs',
        'medication_logs',
        'menstrual_cycle_logs',
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('user_id', user.id);

        if (error) {
          throw new Error(`Failed to delete ${table}: ${error.message}`);
        }
      }

      setShowDeleteConfirm(false);
      setExportMessage('All health data has been deleted.');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete data');
    }
  };

  return (
    <SettingsPageLayout
      title="Data Management"
      description="Export, retain, or permanently remove your records with a clear boundary around what GutWise stores for you."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Data Control</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Keep a readable document and a raw backup
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Export a clinician-friendly DOCX when you want something readable, or keep the raw
                JSON when you need the full structured backup for future migration or restore flows.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Primary export"
                  value="DOCX"
                  helper="Readable Word document"
                  tone="primary"
                />
                <MetricTile
                  label="Backup export"
                  value="JSON"
                  helper="Raw structured data"
                  tone="secondary"
                />
                <MetricTile
                  label="Control"
                  value="Manual"
                  helper="You decide when to export or erase"
                  tone="neutral"
                />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Private record boundary
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    Your data is stored for your own tracking and insight generation. This page is
                    where you move, archive, or permanently clear it.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <Archive className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Best practice: export the readable DOCX for sharing and the raw JSON for backup
                    before making destructive changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex flex-col gap-5">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Export Your Data
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Choose a readable DOCX for sharing or a raw JSON snapshot for system-level backup.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoChip text="DOCX organizes profile and logs into readable sections" />
                <InfoChip text="JSON preserves the raw structured export for technical reuse" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface-panel-quiet rounded-[24px] border border-white/8 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[var(--color-text-primary)]">
                      Readable DOCX export
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Best for review, printing, or sharing with a clinician or family member.
                    </p>
                    <Button
                      onClick={() => handleExport('docx')}
                      disabled={exportingFormat !== null}
                      className="mt-4 w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      {exportingFormat === 'docx' ? 'Preparing DOCX...' : 'Download DOCX'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="surface-intelligence rounded-[24px] border border-[rgba(133,93,255,0.14)] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                    <FileJson className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[var(--color-text-primary)]">
                      Raw JSON backup
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Best for data portability, archival integrity, and future import support.
                    </p>
                    <Button
                      onClick={() => handleExport('json')}
                      disabled={exportingFormat !== null}
                      variant="secondary"
                      className="mt-4 w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      {exportingFormat === 'json' ? 'Preparing JSON...' : 'Download JSON'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Restore from Export
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Re-importing a previous GutWise export is planned, but not yet available in the
                  current product.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button variant="ghost" disabled className="cursor-not-allowed opacity-50">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--color-text-tertiary)]">
                    Coming soon
                  </span>
                </div>

                <p className="mt-4 text-xs leading-6 text-[var(--color-text-tertiary)]">
                  Keep the JSON export if you want the cleanest source for future restore support.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  How your data is handled
                </h3>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>
                    Your health data is stored to power your own GutWise experience and is not sold
                    or shared for unrelated purposes.
                  </p>
                  <p>
                    Records remain available while your account is active, and you can export or
                    delete them from this workspace at any time.
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Privacy policy details should remain the canonical source for legal and retention
                    terms.
                  </p>
                </div>

                <a
                  href="/privacy"
                  className="mt-4 inline-flex text-sm font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Read our Privacy Policy →
                </a>
              </div>
            </div>
          </Card>
        </div>

        <Card
          variant="flat"
          className="rounded-[30px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Delete All Health Data
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Permanently removes your health logs and records from this account. This action
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <div className="lg:w-[220px]">
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  className="w-full text-[var(--color-danger)] hover:bg-[rgba(255,120,120,0.08)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Data
                </Button>
              </div>
            ) : (
              <div className="surface-panel w-full rounded-[24px] border-[rgba(255,120,120,0.22)] p-4 lg:max-w-[360px]">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Delete all health data permanently?
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  This removes tracked records across your account and cannot be reversed.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleDeleteAllData}
                    className="w-full bg-[var(--color-danger)] hover:opacity-90"
                  >
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete Everything
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {deleteError && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
          >
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
              <p className="text-sm font-medium text-[var(--color-danger)]">{deleteError}</p>
            </div>
          </Card>
        )}

        {exportMessage && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.06)]"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
              <p className="text-sm font-medium text-[var(--color-accent-primary)]">
                {exportMessage}
              </p>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}

async function fetchExportPayload(userId: string): Promise<ExportPayload> {
  const exportedData: ExportPayload = {
    exportDate: new Date().toISOString(),
    userId,
  };

  for (const table of EXPORT_TABLES) {
    const query = supabase.from(table).select('*');

    const { data, error } =
      table === 'profiles' ? await query.eq('id', userId) : await query.eq('user_id', userId);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      exportedData[table] = [];
    } else {
      exportedData[table] = data;
    }
  }

  return exportedData;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function createDocxDocument(payload: ExportPayload): Uint8Array {
  const files = [
    {
      name: '[Content_Types].xml',
      data: encodeText(buildContentTypesXml()),
    },
    {
      name: '_rels/.rels',
      data: encodeText(buildRootRelationshipsXml()),
    },
    {
      name: 'word/document.xml',
      data: encodeText(buildDocumentXml(payload)),
    },
  ];

  return createStoredZip(files);
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}

function buildRootRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship
    Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"
  />
</Relationships>`;
}

function buildDocumentXml(payload: ExportPayload) {
  const paragraphs: string[] = [];

  const pushParagraph = (text: string, style: 'title' | 'heading' | 'body' | 'meta' = 'body') => {
    paragraphs.push(renderWordParagraph(text, style));
  };

  pushParagraph('GutWise Data Export', 'title');
  pushParagraph(`Exported ${new Date(payload.exportDate).toLocaleString()}`, 'meta');
  pushParagraph(`User ID: ${payload.userId}`, 'meta');
  pushParagraph('', 'body');

  for (const table of EXPORT_TABLES) {
    const sectionTitle = formatSectionName(table);
    const value = payload[table];
    pushParagraph(sectionTitle, 'heading');

    if (!Array.isArray(value) || value.length === 0) {
      pushParagraph('No records available.', 'body');
      pushParagraph('', 'body');
      continue;
    }

    pushParagraph(`${value.length} ${value.length === 1 ? 'record' : 'records'}`, 'meta');

    value.forEach((record, index) => {
      pushParagraph(`${sectionTitle} ${index + 1}`, 'body');

      if (record && typeof record === 'object' && !Array.isArray(record)) {
        Object.entries(record as Record<string, unknown>).forEach(([key, entryValue]) => {
          pushParagraph(`${formatKey(key)}: ${formatValue(entryValue)}`, 'body');
        });
      } else {
        pushParagraph(formatValue(record), 'body');
      }

      pushParagraph('', 'body');
    });
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${paragraphs.join('')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function renderWordParagraph(text: string, style: 'title' | 'heading' | 'body' | 'meta') {
  if (text === '') {
    return '<w:p/>';
  }

  const escaped = escapeXml(text);
  const runProps =
    style === 'title'
      ? '<w:rPr><w:b/><w:sz w:val="34"/></w:rPr>'
      : style === 'heading'
        ? '<w:rPr><w:b/><w:sz w:val="26"/></w:rPr>'
        : style === 'meta'
          ? '<w:rPr><w:color w:val="6B7280"/><w:sz w:val="20"/></w:rPr>'
          : '<w:rPr><w:sz w:val="22"/></w:rPr>';

  const paragraphProps =
    style === 'title'
      ? '<w:pPr><w:spacing w:after="220"/></w:pPr>'
      : style === 'heading'
        ? '<w:pPr><w:spacing w:before="220" w:after="140"/></w:pPr>'
        : style === 'meta'
          ? '<w:pPr><w:spacing w:after="60"/></w:pPr>'
          : '<w:pPr><w:spacing w:after="80"/></w:pPr>';

  return `<w:p>${paragraphProps}<w:r>${runProps}<w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatSectionName(table: string) {
  return table
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ');
  }
  return JSON.stringify(value);
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function createStoredZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const localParts: number[] = [];
  const centralParts: number[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encodeText(file.name);
    const crc = crc32(file.data);
    const { dosDate, dosTime } = getDosDateTime(new Date());

    const localHeader: number[] = [];
    pushUint32(localHeader, 0x04034b50);
    pushUint16(localHeader, 20);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, 0);
    pushUint16(localHeader, dosTime);
    pushUint16(localHeader, dosDate);
    pushUint32(localHeader, crc);
    pushUint32(localHeader, file.data.length);
    pushUint32(localHeader, file.data.length);
    pushUint16(localHeader, nameBytes.length);
    pushUint16(localHeader, 0);
    pushBytes(localHeader, nameBytes);
    pushBytes(localHeader, file.data);

    const centralHeader: number[] = [];
    pushUint32(centralHeader, 0x02014b50);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, dosTime);
    pushUint16(centralHeader, dosDate);
    pushUint32(centralHeader, crc);
    pushUint32(centralHeader, file.data.length);
    pushUint32(centralHeader, file.data.length);
    pushUint16(centralHeader, nameBytes.length);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, 0);
    pushUint32(centralHeader, offset);
    pushBytes(centralHeader, nameBytes);

    localParts.push(...localHeader);
    centralParts.push(...centralHeader);
    offset += localHeader.length;
  });

  const centralOffset = localParts.length;
  const centralSize = centralParts.length;
  const endOfCentralDirectory: number[] = [];

  pushUint32(endOfCentralDirectory, 0x06054b50);
  pushUint16(endOfCentralDirectory, 0);
  pushUint16(endOfCentralDirectory, 0);
  pushUint16(endOfCentralDirectory, files.length);
  pushUint16(endOfCentralDirectory, files.length);
  pushUint32(endOfCentralDirectory, centralSize);
  pushUint32(endOfCentralDirectory, centralOffset);
  pushUint16(endOfCentralDirectory, 0);

  return Uint8Array.from([...localParts, ...centralParts, ...endOfCentralDirectory]);
}

function pushBytes(target: number[], value: Uint8Array) {
  value.forEach((byte) => target.push(byte));
}

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function getDosDateTime(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);

  return { dosDate, dosTime };
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }

  return table;
})();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function MetricTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'secondary' | 'neutral';
}) {
  const toneClassName =
    tone === 'primary'
      ? 'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]'
      : tone === 'secondary'
        ? 'border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-[rgba(255,255,255,0.03)]';

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function InfoChip({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3 text-sm text-[var(--color-text-secondary)]">
      {text}
    </div>
  );
}
