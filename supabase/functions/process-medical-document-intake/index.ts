import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

const TEXT_FILE_TYPES = new Set(["text/plain"]);

function jsonResponse(status: number, body: ExtractionResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isSupportedTextIntake(intake: MedicalDocumentIntakeRow): boolean {
  const lowerName = intake.file_name.toLowerCase();
  return TEXT_FILE_TYPES.has(intake.file_type) || lowerName.endsWith(".txt");
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

  if (!isSupportedTextIntake(processingIntake)) {
    const failedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "failed",
      extraction_error:
        "Automatic extraction orchestration is active, but this file type is not extracted yet. Manual review remains available until PDF, image, and Word extraction are added.",
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

  const extractedText = (await fileBlob.text()).trim();

  if (!extractedText) {
    const failedIntake = await updateIntake(supabaseAdmin, intake.id, {
      intake_status: "review_ready",
      extraction_status: "failed",
      extraction_error:
        "The uploaded text document did not contain extractable text. Manual review remains available.",
    });

    return jsonResponse(200, {
      success: true,
      intake: failedIntake,
      extraction_supported: true,
      message: failedIntake.extraction_error,
    });
  }

  const completedIntake = await updateIntake(supabaseAdmin, intake.id, {
    intake_status: "review_ready",
    extraction_status: "completed",
    extraction_error: null,
    extracted_text: extractedText,
    extracted_at: new Date().toISOString(),
    page_count: 1,
  });

  return jsonResponse(200, {
    success: true,
    intake: completedIntake,
    extraction_supported: true,
    message: "Text extraction completed and the intake is ready for review",
  });
});