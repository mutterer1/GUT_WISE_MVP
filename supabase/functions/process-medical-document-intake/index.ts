import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { strFromU8, unzipSync } from "npm:fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type IntakeStatus = "uploaded" | "processing" | "review_ready" | "completed" | "failed";
type ExtractionStatus = "not_started" | "queued" | "processing" | "completed" | "failed";

interface MedicalDocumentIntakeRow {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  intake_status: IntakeStatus;
  document_notes: string | null;
  candidate_count: number;
  storage_bucket?: string | null;
  storage_path?: string | null;
  content_sha256?: string | null;
  extraction_status?: ExtractionStatus;
  extraction_error?: string | null;
  extracted_text?: string | null;
  extracted_at?: string | null;
  page_count?: number | null;
  created_at: string;
  updated_at: string;
}

interface ExtractionResponseBody {
  success: boolean;
  intake?: MedicalDocumentIntakeRow;
  extraction_supported?: boolean;
  message?: string | null;
  error?: string;
}

interface ExtractionResult {
  text: string;
  pageCount: number | null;
}

class ExtractionFailure extends Error {
  extractionSupported: boolean;

  constructor(message: string, extractionSupported: boolean) {
    super(message);
    this.name = "ExtractionFailure";
    this.extractionSupported = extractionSupported;
  }
}

const TEXT_FILE_TYPES = new Set(["text/plain"]);
const PDF_FILE_TYPES = new Set(["application/pdf"]);
const DOCX_FILE_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const LEGACY_DOC_FILE_TYPES = new Set(["application/msword"]);
const IMAGE_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function jsonResponse(status: number, body: ExtractionResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateIntake(
  supabaseAdmin: ReturnType<typeof createClient>,
  intakeId: string,
  updates: Partial<MedicalDocumentIntakeRow>
): Promise<MedicalDocumentIntakeRow> {
  const { data, error } = await supabaseAdmin
    .from("medical_document_intakes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intakeId)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as MedicalDocumentIntakeRow;
}

function getLowerFileName(intake: MedicalDocumentIntakeRow): string {
  return intake.file_name.toLowerCase();
}

function isTextIntake(intake: MedicalDocumentIntakeRow): boolean {
  return TEXT_FILE_TYPES.has(intake.file_type) || getLowerFileName(intake).endsWith(".txt");
}

function isPdfIntake(intake: MedicalDocumentIntakeRow): boolean {
  return PDF_FILE_TYPES.has(intake.file_type) || getLowerFileName(intake).endsWith(".pdf");
}

function isDocxIntake(intake: MedicalDocumentIntakeRow): boolean {
  return DOCX_FILE_TYPES.has(intake.file_type) || getLowerFileName(intake).endsWith(".docx");
}

function isLegacyDocIntake(intake: MedicalDocumentIntakeRow): boolean {
  return LEGACY_DOC_FILE_TYPES.has(intake.file_type) || getLowerFileName(intake).endsWith(".doc");
}

function isImageIntake(intake: MedicalDocumentIntakeRow): boolean {
  const lowerName = getLowerFileName(intake);
  return (
    IMAGE_FILE_TYPES.has(intake.file_type) ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].some((extension) =>
      lowerName.endsWith(extension)
    )
  );
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function countPdfPages(rawText: string): number | null {
  const pageMatches = rawText.match(/\/Type\s*\/Page\b/g);
  return pageMatches?.length ? pageMatches.length : null;
}

function latin1StringToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

async function tryDecompressStream(bytes: Uint8Array): Promise<Uint8Array | null> {
  for (const format of ["deflate", "deflate-raw"]) {
    try {
      const blob = new Blob([bytes]);
      const stream = blob.stream().pipeThrough(new DecompressionStream(format as never));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      // Try the next format.
    }
  }

  return null;
}

function decodePdfLiteralString(literal: string): string {
  const source = literal.startsWith("(") && literal.endsWith(")")
    ? literal.slice(1, -1)
    : literal;

  let result = "";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char !== "\\") {
      result += char;
      continue;
    }

    const next = source[index + 1];
    if (!next) break;

    if (/[0-7]/.test(next)) {
      let octal = next;
      let consumed = 1;

      while (
        consumed < 3 &&
        index + 1 + consumed < source.length &&
        /[0-7]/.test(source[index + 1 + consumed])
      ) {
        octal += source[index + 1 + consumed];
        consumed += 1;
      }

      result += String.fromCharCode(parseInt(octal, 8));
      index += consumed;
      continue;
    }

    switch (next) {
      case "n":
        result += "\n";
        break;
      case "r":
        result += "\r";
        break;
      case "t":
        result += "\t";
        break;
      case "b":
        result += "\b";
        break;
      case "f":
        result += "\f";
        break;
      case "(":
      case ")":
      case "\\":
        result += next;
        break;
      case "\n":
      case "\r":
        break;
      default:
        result += next;
        break;
    }

    index += 1;
  }

  return result;
}

function collectPdfLiteralStrings(content: string): string[] {
  const decoded: string[] = [];
  let depth = 0;
  let current = "";
  let escaping = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (depth === 0) {
      if (char === "(") {
        depth = 1;
        current = "(";
      }
      continue;
    }

    current += char;

    if (escaping) {
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;

      if (depth === 0) {
        decoded.push(decodePdfLiteralString(current));
        current = "";
      }
    }
  }

  return decoded;
}

function extractPdfTextFromContent(content: string): string {
  const textBlocks = Array.from(content.matchAll(/BT([\s\S]*?)ET/g));
  const segments = textBlocks.length > 0
    ? textBlocks.map((match) => match[1])
    : [content];

  const strings = segments.flatMap((segment) => collectPdfLiteralStrings(segment));
  return normalizeExtractedText(strings.join("\n"));
}

async function extractPdfText(buffer: Uint8Array): Promise<ExtractionResult> {
  const rawPdfText = new TextDecoder("latin1").decode(buffer);
  const collectedTexts: string[] = [];

  const streamRegex = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch: RegExpExecArray | null;

  while ((streamMatch = streamRegex.exec(rawPdfText)) !== null) {
    const dictText = streamMatch[1];
    const streamText = streamMatch[2];
    let contentText = streamText;

    if (/\/FlateDecode\b/.test(dictText)) {
      const decompressed = await tryDecompressStream(latin1StringToBytes(streamText));
      if (decompressed) {
        contentText = new TextDecoder("latin1").decode(decompressed);
      }
    }

    const extracted = extractPdfTextFromContent(contentText);
    if (extracted) {
      collectedTexts.push(extracted);
    }
  }

  if (collectedTexts.length === 0) {
    const fallbackText = extractPdfTextFromContent(rawPdfText);
    if (fallbackText) {
      collectedTexts.push(fallbackText);
    }
  }

  const text = normalizeExtractedText(collectedTexts.join("\n\n"));
  if (!text) {
    throw new ExtractionFailure(
      "This PDF appears scanned, image-based, or encoded in a way the current extractor could not read. Manual review remains available until OCR support is added.",
      true,
    );
  }

  return {
    text,
    pageCount: countPdfPages(rawPdfText) ?? 1,
  };
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#160;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)));
}

function convertDocxXmlToText(xml: string): string {
  const withBreaks = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<\/w:tbl>/g, "\n\n");

  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");
  return normalizeExtractedText(decodeXmlEntities(withoutTags));
}

function readDocxPageCount(zipEntries: Record<string, Uint8Array>): number | null {
  const appXml = zipEntries["docProps/app.xml"];
  if (!appXml) return null;

  const xml = strFromU8(appXml);
  const pagesMatch = xml.match(/<Pages>(\d+)<\/Pages>/i);
  if (!pagesMatch) return null;

  const pages = Number(pagesMatch[1]);
  return Number.isFinite(pages) && pages > 0 ? pages : null;
}

async function extractDocxText(buffer: Uint8Array): Promise<ExtractionResult> {
  let zipEntries: Record<string, Uint8Array>;

  try {
    zipEntries = unzipSync(buffer);
  } catch {
    throw new ExtractionFailure(
      "The DOCX file could not be opened for text extraction. Manual review remains available.",
      true,
    );
  }

  const xmlPaths = Object.keys(zipEntries)
    .filter((path) =>
      /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/i.test(path)
    )
    .sort();

  const xmlTexts = xmlPaths
    .map((path) => convertDocxXmlToText(strFromU8(zipEntries[path])))
    .filter(Boolean);

  const text = normalizeExtractedText(xmlTexts.join("\n\n"));
  if (!text) {
    throw new ExtractionFailure(
      "The DOCX file did not contain readable text for the current extractor. Manual review remains available.",
      true,
    );
  }

  return {
    text,
    pageCount: readDocxPageCount(zipEntries) ?? 1,
  };
}

async function extractPlainText(blob: Blob): Promise<ExtractionResult> {
  const text = normalizeExtractedText(await blob.text());

  if (!text) {
    throw new ExtractionFailure(
      "The uploaded text document did not contain extractable text. Manual review remains available.",
      true,
    );
  }

  return {
    text,
    pageCount: 1,
  };
}

function getUnsupportedFormatMessage(intake: MedicalDocumentIntakeRow): string {
  if (isImageIntake(intake)) {
    return "Image OCR is not enabled yet. Manual review remains available until OCR support is added.";
  }

  if (isLegacyDocIntake(intake)) {
    return "Legacy .doc extraction is not enabled yet. Please continue with manual review or re-export as DOCX/PDF when possible.";
  }

  return "Automatic extraction is not available for this file type yet. Manual review remains available.";
}

async function extractMedicalDocument(
  intake: MedicalDocumentIntakeRow,
  fileBlob: Blob
): Promise<ExtractionResult> {
  if (isTextIntake(intake)) {
    return extractPlainText(fileBlob);
  }

  const buffer = new Uint8Array(await fileBlob.arrayBuffer());

  if (isPdfIntake(intake)) {
    return extractPdfText(buffer);
  }

  if (isDocxIntake(intake)) {
    return extractDocxText(buffer);
  }

  throw new ExtractionFailure(getUnsupportedFormatMessage(intake), false);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, {
      success: false,
      error: "Method not allowed",
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, {
      success: false,
      error: "Supabase edge function environment is not configured",
    });
  }

  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (!accessToken) {
    return jsonResponse(401, {
      success: false,
      error: "Missing authorization token",
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return jsonResponse(401, {
      success: false,
      error: "Unable to authenticate document extraction request",
    });
  }

  let intakeId = "";
  try {
    const body = await req.json();
    intakeId = typeof body?.intake_id === "string" ? body.intake_id : "";
  } catch {
    return jsonResponse(400, {
      success: false,
      error: "Invalid JSON body",
    });
  }

  if (!intakeId) {
    return jsonResponse(400, {
      success: false,
      error: "Missing intake_id",
    });
  }

  const { data: intakeData, error: intakeError } = await supabaseAdmin
    .from("medical_document_intakes")
    .select("*")
    .eq("id", intakeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (intakeError) {
    return jsonResponse(500, {
      success: false,
      error: intakeError.message,
    });
  }

  if (!intakeData) {
    return jsonResponse(404, {
      success: false,
      error: "Document intake not found",
    });
  }

  const intake = intakeData as MedicalDocumentIntakeRow;

  if (intake.extraction_status === "completed" && intake.extracted_text) {
    return jsonResponse(200, {
      success: true,
      intake,
      extraction_supported: true,
      message: "Document already extracted",
    });
  }

  const processingIntake = await updateIntake(supabaseAdmin, intake.id, {
    intake_status: "processing",
    extraction_status: "processing",
    extraction_error: null,
  });

  if (!processingIntake.storage_bucket || !processingIntake.storage_path) {
    const failedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "failed",
      extraction_error:
        "This intake does not have a stored document artifact. Manual review remains available.",
    });

    return jsonResponse(200, {
      success: true,
      intake: failedIntake,
      extraction_supported: false,
      message: failedIntake.extraction_error,
    });
  }

  const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
    .from(processingIntake.storage_bucket)
    .download(processingIntake.storage_path);

  if (downloadError || !fileBlob) {
    const failedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "failed",
      extraction_error: `Failed to download the stored document for extraction. ${downloadError?.message ?? ""}`.trim(),
    });

    return jsonResponse(200, {
      success: true,
      intake: failedIntake,
      extraction_supported: true,
      message: failedIntake.extraction_error,
    });
  }

  try {
    const extraction = await extractMedicalDocument(processingIntake, fileBlob);
    const completedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "completed",
      extraction_error: null,
      extracted_text: extraction.text,
      extracted_at: new Date().toISOString(),
      page_count: extraction.pageCount,
    });

    return jsonResponse(200, {
      success: true,
      intake: completedIntake,
      extraction_supported: true,
      message: "Document extraction completed and the intake is ready for review",
    });
  } catch (error) {
    const extractionSupported =
      error instanceof ExtractionFailure ? error.extractionSupported : true;
    const message =
      error instanceof Error
        ? error.message
        : "Document extraction failed. Manual review remains available.";

    const failedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "failed",
      extraction_error: message,
    });

    return jsonResponse(200, {
      success: true,
      intake: failedIntake,
      extraction_supported: extractionSupported,
      message,
    });
  }
});
