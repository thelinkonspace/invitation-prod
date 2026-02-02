import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { session_token, partner, companionCounts } = req.body;

  // validasi sederhana
  if (!session_token) {
    return res.status(400).json({ message: "session_token is required" });
  }
  if (!partner) {
    return res.status(400).json({ message: "partner is required" });
  }
  if (!companionCounts) {
    return res.status(400).json({ message: "companionCounts is required" });
  }

  const { data: candidate } = await supabase
  .from("hunter_candidates")
  .select("id")
  .eq("session_token", session_token)
  .single();

  if (!candidate) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const { data, error } = await supabase
  .from("quiz_results")
  .insert({
    candidate_id: candidate.id,
    partner: partner,
    counts: companionCounts
  });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({
    message: "Result inserted successfully"
  });
}

