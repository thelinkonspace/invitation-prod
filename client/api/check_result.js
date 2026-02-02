import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  // 1. Ambil candidate berdasarkan session_token
  const { data: candidate, error: candidateError } = await supabase
    .from("hunter_candidates")
    .select("id")
    .eq("session_token", token)
    .maybeSingle();

  if (candidateError || !candidate) {
    return res.status(404).json({
      success: false,
      message: "Candidate not found",
    });
  }

  // 2. Ambil hasil quiz berdasarkan candidate_id
  const { data: quizResult, error: quizError } = await supabase
    .from("quiz_results")
    .select("partner, counts, created_at")
    .eq("candidate_id", candidate.id)
    .order("created_at", { ascending: false })
    .limit(1);

    if (quizError || !quizResult || quizResult.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Quiz result not found",
        });
    }

    const latestQuiz = quizResult[0];

  return res.status(200).json({
    success: true,
    data: latestQuiz,
  });
}
