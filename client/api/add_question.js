import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { question, options } = req.body;

  // validasi sederhana
  if (!question) {
    return res.status(400).json({ message: "question is required" });
  }

  const { data, error } = await supabase
    .from("questions")
    .insert([
      {
        question,
        options,
      },
    ])
    .select(); // supaya data yang baru diinsert dikembalikan

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({
    message: "Question created successfully",
    data,
  });
}
