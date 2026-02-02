import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { data } = await supabase
    .from("quiz_results")
    .select("partner, counts")
    .eq("candidate_id", token)
    .maybeSingle();

  if (!data) {
    return res.status(401).json({ success: false });
  }

  return res.json({ success: true, data });
}
