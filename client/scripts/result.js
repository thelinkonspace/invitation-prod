const popup = document.getElementById("popup");
const form = document.getElementById("welcomeForm");

// Ambil quiz state jika ada
function getQuizResults() {
  const QUIZ_STORAGE_KEY = "quiz_state_v1";
  const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
  
  if (!raw) {
    console.log("[Result] No quiz state found");
    return null;
  }

  try {
    const state = JSON.parse(raw);
    console.log("[Result] Quiz state retrieved:", { currentQuestion: state.currentQuestionIndex, totalAnswers: state.answers?.length });
    return state;
  } catch (error) {
    console.error("[Result] Error parsing quiz state:", error);
    return null;
  }
}

// Clear quiz state setelah digunakan
function clearQuizState() {
  const QUIZ_STORAGE_KEY = "quiz_state_v1";
  localStorage.removeItem(QUIZ_STORAGE_KEY);
  console.log("[Result] Quiz state cleared");
}

window.addEventListener("load", () => {  // Ambil hasil quiz (jika ada)
  const quizResults = getQuizResults();
  
  // TODO: Gunakan quizResults untuk menampilkan hasil yang sesuai
  if (quizResults) {
    console.log("[Result] Using quiz results:", quizResults.answers);
    // Implementasi logika untuk menampilkan hasil berdasarkan jawaban
  }
  // muncul “pop up” setelah page tampil
  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    refCode: form.refCode.value.trim(),
  };

  if (!data.firstName || !data.lastName) return;

  console.log("SUBMIT:", data);

  // Clear quiz state sebelum meninggalkan halaman
  clearQuizState();

  // contoh: tutup popup
  popup.classList.remove("show");

});
