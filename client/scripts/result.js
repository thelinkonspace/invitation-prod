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
    // if totalPoints already saved, use it; otherwise compute from answers
    if (!Number.isFinite(state.totalPoints)) {
      const totalPoints = (state.answers || []).reduce((acc, a) => {
        if (!a && a !== 0) return acc;
        if (typeof a === 'object' && Number.isFinite(a.points)) return acc + a.points;
        if (typeof a === 'number') return acc + (a + 1); // fallback: assume 0->1,1->2, etc.
        return acc;
      }, 0);
      state.totalPoints = totalPoints;
    }

    console.log("[Result] Quiz state retrieved:", { currentQuestion: state.currentQuestionIndex, totalAnswers: state.answers?.length, totalPoints: state.totalPoints });
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
  
  if (quizResults) {
    console.log("[Result] Using quiz results:", quizResults.answers, "totalPoints:", quizResults.totalPoints);

    // Simple profile selection based on totalPoints (adjust thresholds as needed)
    const total = quizResults.totalPoints || 0;

    const profiles = [
      { max: 16, name: 'Xavier', img: '/assets/img/res-xavier.png', text: `Xavier adalah sosok yang memilih berdiri di sampingmu, bukan di depan atau di atasmu. Dia tenang, jarang berbicara, namun kehadirannya selalu terasa terutama saat dunia mulai terasa terlalu berat. Xavier mencintai dengan cara yang sunyi. Dia tidak menuntut, tidak mengekang, dan tidak memaksamu untuk bergantung padanya.`, text2: `Kamu cocok dengannya karena kamu menghargai ruang dan kebebasan, namun tetap membutuhkan seseorang yang tidak pergi. Bersama Xavier, kamu tidak perlu berpura-pura kuat sepanjang waktu. Dia akan menjagamu dari balik bayangan dan memastikan kamu bisa terus melangkah dengan caramu sendiri.` },
      { max: 24, name: 'Rafayel', img: '/assets/img/res-rafayel.png', text: `Rafayel adalah kehangatan di dunia yang kejam. Dia ekspresif, emosional, dan tidak pernah ragu menunjukkan perasaannya. Di antara misi dan bahaya, Rafayel mengingatkanmu bahwa merasakan emosi bukan kelemahan, melainkan alasan untuk terus hidup.`, text2: `Kamu cocok dengannya karena hatimu membutuhkan kejujuran dan koneksi yang tulus. Rafayel mencintaimu tanpa topeng, tanpa jarak, dan tanpa ragu. Bersamanya, setiap hari terasa lebih hidup meski dunia tidak pernah benar-benar aman.` },
      { max: 32, name: 'Sylus', img: '/assets/img/res-sylus.png', text: `Sylus adalah kekuatan yang tidak mengenal kompromi. Dia dominan, intens, dan tidak ragu melangkah ke sisi gelap demi melindungimu. Bagi Sylus, dunia hanyalah medan pertempuran dan kamu adalah satu-satunya hal yang tidak boleh hilang.`, text2: `Kamu cocok dengannya karena kamu tidak takut menghadapi bahaya dan kegelapan. Kamu memahami bahwa perlindungan terkadang datang dengan harga, dan Sylus adalah orang yang bersedia membayar harga itu tanpa ragu. Bersamanya, tidak ada ancaman yang dibiarkan mendekat.`},
      { max: Infinity, name: 'Zayne', img: '/assets/img/res-zayne.png', text: `Zayne adalah sosok yang dingin di luar namun penuh tanggung jawab di dalam. Dia selalu berpikir beberapa langkah ke depan, menimbang risiko, dan memastikan keselamatanmu sebelum apa pun. Cintanya mungkin tidak selalu lembut, tetapi selalu konsisten dan bisa diandalkan.`, text2: `Kamu cocok dengannya karena kamu membutuhkan stabilitas di tengah kekacauan. Saat emosi dan situasi mulai tidak terkendali, Zayne adalah orang yang akan memegang kendali dan memastikan kamu tetap berdiri. Bersamanya, kamu merasa aman karena tahu ada seseorang yang tidak akan lengah.` }
    ];

    const found = profiles.find(p => total <= p.max) || profiles[profiles.length - 1];

    const titleEl = document.querySelector('.card-title');
    const imgEl = document.getElementById('result-image');
    const textEl = document.getElementById('result-text');

    if (titleEl) titleEl.textContent = `Partner Deepspace Hunter-mu adalah ${found.name}.`;
    if (imgEl) imgEl.src = found.img;

    // Update description and score without removing existing buttons
    if (textEl) {
      // Description paragraph (preserve if already exists)
      let descP = textEl.querySelector('.result-desc');
      if (!descP) {
        descP = document.createElement('p');
        descP.className = 'result-desc';
        // Insert before btn-container if exists, otherwise append
        const btnContainer = textEl.querySelector('.btn-container');
        if (btnContainer) textEl.insertBefore(descP, btnContainer);
        else textEl.appendChild(descP);
      }
      descP.textContent = found.text; // first part of description
      // Add second part of description
      const descP2 = document.createElement('p');
      descP2.className = 'result-desc';
      descP2.textContent = found.text2;
      descP.after(descP2);

      // Score paragraph
      //let scoreP = textEl.querySelector('.result-score');
      //if (!scoreP) {
      //  scoreP = document.createElement('p');
      //  scoreP.className = 'result-score';
        // place score after description
      //  descP.after(scoreP);
      //}
      //scoreP.innerHTML = `Skor kamu: <strong>${total}</strong>`;
    }

    // Restart button (konfirmasi sebelum membersihkan state dan memulai ulang)
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) restartBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Yakin ingin mengulang quiz? Semua jawaban akan dihapus.');
      if (!confirmed) return;
      clearQuizState();
      window.location.href = '/quiz';
    });

    // Optional: allow download (simple text file)
    const downloadBtn = document.getElementById('btn-download');
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
      const blob = new Blob([`Hasil quiz - Skor: ${total}\nPartner: ${found.name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-result-${found.name}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
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
