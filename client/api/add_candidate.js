import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const sessionToken = crypto.randomUUID();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
    });
  }

  const { username, oc_name, code_ref, mode = "create" } = req.body;

  // ===== VALIDATION =====
  if (!username) {
    return res.status(400).json({
      success: false,
      code: "USERNAME_REQUIRED",
      message: "username is required",
    });
  }

  if (!code_ref) {
    return res.status(400).json({
      success: false,
      code: "CODE_REF_REQUIRED",
      message: "code_ref is required",
    });
  }

  const codeRefStr = String(code_ref);

  if (!/^\d{6}$/.test(codeRefStr)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_CODE_REF",
      message: "code_ref must be exactly 6 digits",
    });
  }

  const parsedCodeRef = Number(codeRefStr);

  // ===== CHECK AVAILABLE CODE =====
  const { data: available, error: availableErr } = await supabase
    .from("available_codes")
    .select("username, code_ref")
    .eq("username", username)
    .eq("code_ref", parsedCodeRef)
    .maybeSingle();

  if (availableErr) {
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: availableErr.message,
    });
  }

  if (!available) {
    return res.status(401).json({
      success: false,
      code: "INVALID_CREDENTIAL",
      message: "Username and code reference are invalid",
    });
  }

  // ===== MODE: CHECK ONLY (LOGIN-LIKE) =====
  if (mode === "check") {
    return res.status(200).json({
      success: true,
      code: "VALID_CREDENTIAL",
      message: "Credential is valid",
      data: {
        username,
        code_ref: parsedCodeRef,
      },
    });
  }

  // ===== MODE: CREATE =====
  if (!oc_name) {
    return res.status(400).json({
      success: false,
      code: "OC_NAME_REQUIRED",
      message: "oc_name is required",
    });
  }

  // ===== CHECK EXISTING CANDIDATE =====
  const { data: existing, error: existErr } = await supabase
    .from("hunter_candidates")
    .select("id, username, oc_name, session_token")
    .eq("username", username)
    .maybeSingle();

  if (existErr) {
    return res.status(500).json({
      success: false,
      code: "DATABASE_ERROR",
      message: existErr.message,
    });
  }

  // If already exists, treat as success but don't insert again
  if (existing) {
    return res.status(200).json({
      success: true,
      code: "CANDIDATE_EXISTS",
      message: "Candidate already registered",
      data: {
        id: existing.id,
        username: existing.username,
        oc_name: existing.oc_name,
        session_token: existing.session_token,
      },
    });
  }

  const { data, error } = await supabase
    .from("hunter_candidates")
    .insert([
      {
        username,
        oc_name,
        code_ref: parsedCodeRef,
        session_token: sessionToken,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      success: false,
      code: "INSERT_FAILED",
      message: error.message,
    });
  }

  return res.status(201).json({
    success: true,
    code: "CANDIDATE_CREATED",
    message: "Candidate created successfully",
    data: {
      id: data.id,
      username: data.username,
      oc_name: data.oc_name,
      session_token: sessionToken,
    },
  });
}
