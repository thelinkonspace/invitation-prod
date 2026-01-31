import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ success: false });
  }

  const { data } = await supabase
    .from("hunter_candidates")
    .select("id")
    .eq("session_token", token)
    .maybeSingle();

  if (!data) {
    return res.status(401).json({ success: false });
  }

  return res.json({ success: true });
}
