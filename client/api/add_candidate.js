import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, oc_name, code_ref } = req.body;

  // validasi sederhana
  if (!username) {
    return res.status(400).json({ message: "username is required" });
  }

  if (!oc_name) {
    return res.status(400).json({ message: "oc_name is required" });
  }

  if (code_ref === undefined || code_ref === null) {
    return res.status(400).json({ message: "code_ref is required" });
  }

  const codeRefStr = String(code_ref);

  // hanya angka
  if (!/^\d+$/.test(codeRefStr)) {
    return res.status(400).json({
      message: "code_ref must contain only numbers",
    });
  }

  // tepat 6 digit
  if (codeRefStr.length !== 6) {
    return res.status(400).json({
      message: "code_ref must be exactly 6 digits",
    });
  }

  const parsedCodeRef = Number(codeRefStr);

  // ✅ CEK KE available_codes: username + code_ref harus match
  const { data: available, error: availableErr } = await supabase
    .from("available_codes")
    .select("username, code_ref")
    .eq("username", username)
    .eq("code_ref", parsedCodeRef)
    .maybeSingle();

  if (availableErr) {
    return res.status(500).json({ message: availableErr.message });
  }

  if (!available) {
    return res.status(400).json({
      message: "username and code_ref do not match / not available",
    });
  }

  // ✅ kalau match, baru insert ke hunter_candidates
  const { data, error } = await supabase
    .from("hunter_candidates")
    .insert([
      {
        username,
        oc_name,
        code_ref: parsedCodeRef,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(201).json({
    message: "Candidate created successfully",
    data,
  });
}
