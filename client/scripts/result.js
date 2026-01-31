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

    // Count companion votes (supports legacy shapes with 'points' or numeric answers)
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    (state.answers || []).forEach(a => {
      if (!a && a !== 0) return;
      let c = null;
      if (typeof a === 'object') {
        if (Number.isFinite(a.companion)) c = a.companion;
        else if (Number.isFinite(a.points)) c = a.points; // fallback for older shapes
      } else if (typeof a === 'number') {
        // legacy numeric index mapped to a+1 (best-effort fallback)
        c = a + 1;
      }
      if (c && counts[c] !== undefined) counts[c]++;
    });

    state.companionCounts = counts;
    // pick the companion with highest votes (ties -> smallest companion id)
    const top = Object.keys(counts).reduce((best, k) => (counts[k] > counts[best] ? k : best), '1');
    state.topCompanion = Number(top);

    console.log("[Result] Quiz state retrieved:", { currentQuestion: state.currentQuestionIndex, totalAnswers: state.answers?.length, companionCounts: state.companionCounts, topCompanion: state.topCompanion });
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
    console.log("[Result] Using quiz results:", quizResults.answers, "companionCounts:", quizResults.companionCounts, "topCompanion:", quizResults.topCompanion);

    // Map companion id to profile (user mapping: 1->Xavier, 2->Zayne, 3->Rafayel, 4->Sylus)
    const profiles = {
      1: { name: 'Xavier', img: '/assets/img/res-xavier.png', text: `Xavier adalah sosok yang memilih berdiri di sampingmu, bukan di depan atau di belakangmu. Dia tenang, jarang berbicara, namun kehadirannya selalu terasa.` , text2: `Kamu cocok dengannya karena kamu menghargai ruang dan kebebasan, namun tetap membutuhkan seseorang yang tidak pergi.` },
      2: { name: 'Zayne', img: '/assets/img/res-zayne.png', text: `Zayne adalah sosok yang dingin di luar namun penuh tanggung jawab di dalam. Dia selalu berpikir beberapa langkah ke depan, menimbang risiko, dan memastikan keselamatanmu.` , text2: `Kamu cocok dengannya karena kamu membutuhkan stabilitas di tengah kekacauan.` },
      3: { name: 'Rafayel', img: '/assets/img/res-rafayel.png', text: `Rafayel membawa warna dan keceriaan. Dia mudah mengekspresikan perasaan dan membuat hari-harimu lebih ringan.` , text2: `Kamu cocok dengannya karena hatimu membutuhkan kejujuran dan koneksi yang tulus.` },
      4: { name: 'Sylus', img: '/assets/img/res-sylus.png', text: `Sylus adalah kekuatan yang tidak mengenal kompromi. Dia dominan, intens, dan tidak ragu melangkah ke sisi gelap demi melindungimu.` , text2: `Kamu cocok dengannya karena kamu tidak takut menghadapi bahaya dan kegelapan.` }
    };

    // CALeb Priority Override (Aturan Caleb)
    // Jika companion1 >=4 AND companion2 <=2 AND companion4 <=1 => pemenang langsung Caleb
    const counts = quizResults.companionCounts || {};
    const c1 = counts[1] || 0;
    const c2 = counts[2] || 0;
    const c3 = counts[3] || 0;
    const c4 = counts[4] || 0;

    let chosenLabel = null;
    let found = null;

    if (c1 >= 4 && c2 <= 2 && c4 <= 1) {
      // Caleb override applies
      chosenLabel = 'Caleb (Priority Override)';
      found = { name: 'Caleb', img: '/assets/img/res-caleb.png', text: `Caleb adalah sosok yang mengayomi dan penuh dedikasi. Ketika syarat khusus terpenuhi, Caleb dipilih karena keselarasan karakter yang mendominasi pada pilihanmu.`, text2: `Caleb akan berdiri untukmu dengan penuh komitmen dan perhatian yang stabil.` };
      console.log('[Result] Caleb override applied');
    } else {
      // fallback: pilih companion dengan suara terbanyak (tie -> smallest id)
      const top = quizResults.topCompanion || 1;
      found = profiles[top] || profiles[1];
      chosenLabel = found.name;
    }

    const titleEl = document.querySelector('.card-title');
    const imgEl = document.getElementById('result-image');
    const textEl = document.getElementById('result-text');

    if (titleEl) titleEl.textContent = `Partner Deepspace Hunter-mu adalah ${found.name}.`;
    if (imgEl) imgEl.src = found.img;

    // Update description and counts without removing existing buttons
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

      // second part
      let descP2 = textEl.querySelector('.result-desc-2');
      if (!descP2) {
        descP2 = document.createElement('p');
        descP2.className = 'result-desc-2';
        descP.after(descP2);
      }
      descP2.textContent = found.text2;

      // show counts
      let countsP = textEl.querySelector('.result-counts');
      if (!countsP) {
        countsP = document.createElement('p');
        countsP.className = 'result-counts';
        descP2.after(countsP);
      }
      const counts = quizResults.companionCounts || {};
      countsP.innerHTML = `Hasil suara — Xavier: <strong>${counts[1]||0}</strong>, Zayne: <strong>${counts[2]||0}</strong>, Rafayel: <strong>${counts[3]||0}</strong>, Sylus: <strong>${counts[4]||0}</strong>`;
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
      const counts = quizResults.companionCounts || {};
      const blob = new Blob([`Hasil quiz - Partner: ${found.name}\nXavier: ${counts[1]||0}\nZayne: ${counts[2]||0}\nRafayel: ${counts[3]||0}\nSylus: ${counts[4]||0}`], { type: 'text/plain' });
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
