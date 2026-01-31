import { goTo } from "../scripts/core.js";

const popup = document.getElementById("popup");
const startBtn = document.getElementById("startBtn");
const bgm = document.getElementById("bgm");
const cardQuiz = document.querySelector(".card-quiz");

// Array pertanyaan (setiap opsi sekarang menyertakan poin untuk perhitungan hasil)
const questions = [
  {
    question: "Saat misi berbahaya dan sinyal komunikasi terputus, apa yang pertama kali kamu lakukan?",
    options: [
      { text: "Tetap tenang dan analisis situasi", points: 2 },
      { text: "Cari perlindungan segera", points: 1 },
      { text: "Hubungi pusat komando untuk bantuan", points: 3 },
      { text: "Gunakan alat navigasi untuk menemukan jalan keluar", points: 4 }
    ]
  },
  {
    question: "Partner ideal menurutmu adalah seseorang yang…",
    options: [
      { text: "Selalu ada di sisimu tanpa banyak bicara", points: 1 },
      { text: "Memberimu rasa aman dan stabilitas", points: 2 },
      { text: "Membuat hidup terasa lebih hidup dan berwarna", points: 3 },
      { text: "Mendorongmu menjadi versi terkuat dari dirimu", points: 4 }
    ]
  },
  {
    question: "Setelah misi selesai dan kamu terluka, apa yang kamu harapkan dari partnermu?",
    options: [
      { text: "Menemanimu diam-diam sampai kamu tertidur", points: 1 },
      { text: "Merawatmu dengan teliti dan penuh perhatian", points: 2 },
      { text: "Menghiburmu agar kamu lupa rasa sakit", points: 3 },
      { text: "Meyakinkanmu bahwa kamu tidak boleh jatuh di medan perang", points: 4 }
    ]
  },
  {
    question: "Dalam tim Deepspace Hunter, peran apa yang paling cocok untukmu?",
    options: [
      { text: "Pelindung garis depan", points: 4 },
      { text: "Perencana dan pengambil keputusan", points: 2 },
      { text: "Pendukung fleksibel yang bisa menyesuaikan situasi", points: 3 },
      { text: "Pemimpin lapangan yang tegas", points: 1 }
    ]
  },
  {
    question: "Jika partnermu menyembunyikan rahasia besar, kamu akan…",
    options: [
      { text: "Menunggu sampai dia siap bercerita", points: 1 },
      { text: "Menghadapinya secara langsung dan rasional", points: 2 },
      { text: "Menggoda atau bercanda untuk mencairkan suasana", points: 3 },
      { text: "Memaksa kebenaran keluar, apa pun risikonya", points: 4 }
    ]
  },  
  {
    question: "Bagaimana caramu menunjukkan rasa sayang?",
    options: [
      { text: "Lewat tindakan kecil tanpa banyak kata", points: 1 },
      { text: "Dengan perhatian konsisten dan tanggung jawab", points: 2 },
      { text: "Lewat kata-kata, sentuhan, dan ekspresi emosional", points: 3 },
      { text: "Dengan proteksi dan posesivitas", points: 4 }
    ]
  },
  {
    question: "Saat dunia terasa terlalu kejam, apa yang paling kamu butuhkan?",
    options: [
      { text: "Seseorang yang memahami diam-mu", points: 1 },
      { text: "Seseorang yang bisa diandalkan sepenuhnya", points: 2 },
      { text: "Seseorang yang membuatmu tersenyum lagi", points: 3 },
      { text: "Seseorang yang berkata, “Berdiri. Kita lawan.”", points: 4 }
    ]
  },
  {
    question: "Dalam hubungan, kamu paling takut pada…",
    options: [
      { text: "Ditinggalkan tanpa penjelasan", points: 1 },
      { text: "Kehilangan orang yang kamu lindungi", points: 2 },
      { text: "Hubungan yang terasa hambar", points: 3 },
      { text: "Kehilangan kendali dan kekuatan", points: 4 }
    ]
  },
  {
    question: "Jika harus memilih, kamu lebih menghargai partner yang…",
    options: [
      { text: "Setia meski tak banyak menuntut", points: 1 },
      { text: "Selalu memprioritaskan keselamatanmu", points: 2 },
      { text: "Jujur pada perasaannya", points: 3 },
      { text: "Tidak ragu mengotori tangannya demi kamu", points: 4 }
    ]
  },
  {
    question: "Kalimat mana yang paling kamu harapkan diucapkan partnermu?",
    options: [
      { text: "“Aku di sini. Kamu tidak sendirian.”", points: 1 },
      { text: "“Serahkan padaku, aku akan menjagamu.”", points: 2 },
      { text: "“Selama kita bersama, semuanya akan baik-baik saja.”", points: 3 },
      { text: "“Dunia boleh melawanmu, tapi aku tidak.”", points: 4 }
    ]
  }
];

let currentQuestionIndex = 0;
let answers = []; // untuk menyimpan jawaban

const STORAGE_KEY = "quiz_state_v1";
const STATE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 jam

function saveState() {
  const state = {
    currentQuestionIndex,
    answers,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  console.log("[Quiz] State saved:", { currentQuestion: currentQuestionIndex, totalAnswers: answers.length });
}

function isStateExpired(savedAt) {
  const now = Date.now();
  const ageMs = now - savedAt;
  const isExpired = ageMs > STATE_EXPIRY_MS;
  
  if (isExpired) {
    console.warn(`[Quiz] State expired. Age: ${(ageMs / 1000 / 60 / 60).toFixed(2)} hours`);
  }
  
  return isExpired;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    console.log("[Quiz] No saved state found");
    return false;
  }

  try {
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.answers)) {
      console.warn("[Quiz] Invalid state structure");
      return false;
    }

    // Cek apakah state sudah expired
    if (state.savedAt && isStateExpired(state.savedAt)) {
      console.log("[Quiz] State expired, clearing and starting fresh");
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    currentQuestionIndex = Number.isInteger(state.currentQuestionIndex)
      ? state.currentQuestionIndex
      : 0;

    answers = state.answers;

    // Normalize legacy answers (number -> {index, points}) so downstream code can assume object shape
    answers = answers.map((a, i) => {
      if (a === undefined || a === null) return a;
      if (typeof a === 'object' && a.index !== undefined) return a; // already modern shape
      if (typeof a === 'number') {
        const idx = a;
        const q = questions[i];
        const opt = q && q.options && q.options[idx];
        const pts = opt && (typeof opt === 'object' ? (opt.points || 0) : 0);
        return { index: idx, points: pts };
      }
      return a;
    });

    // jaga-jaga kalau index melewati jumlah pertanyaan
    if (currentQuestionIndex < 0) currentQuestionIndex = 0;
    if (currentQuestionIndex >= questions.length) currentQuestionIndex = questions.length - 1;

    console.log("[Quiz] State restored:", { currentQuestion: currentQuestionIndex, totalAnswers: answers.length });
    return true;
  } catch (error) {
    console.error("[Quiz] Error parsing state:", error);
    return false;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  console.log("[Quiz] State cleared from localStorage");
}

// Fungsi untuk update pertanyaan
function updateQuestion() {
  const q = questions[currentQuestionIndex];
  // support legacy options as string or modern object {text, points}
  cardQuiz.innerHTML = `
    <div class="card-caption">${q.question}</div>
    <div class="card-options">
      ${q.options.map((option, idx) => {
        const text = typeof option === 'string' ? option : option.text;
        const points = typeof option === 'string' ? 0 : (option.points || 0);
        return `<button class="btn-card" type="button" data-index="${idx}" data-points="${points}">${text}</button>`
      }).join('')}
    </div>
  `;

  // Toggle visibility tombol Previous
  const prevBtn = document.getElementById("prevBtn");
  if (currentQuestionIndex === 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "inline-block";
  }

  // Update teks tombol Next
  const nextBtn = document.getElementById("nextBtn");
  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.textContent = "Finish";
  } else {
    nextBtn.textContent = "Next";
  }

  // Tambahkan event listener untuk opsi
  const optionButtons = cardQuiz.querySelectorAll('.btn-card');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const pts = Number(btn.dataset.points);
      answers[currentQuestionIndex] = { index: idx, points: pts }; // simpan object jawaban

      // Opsional: highlight tombol yang dipilih
      optionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      saveState(); // ✅ simpan tiap klik jawaban
    });
  });

  // Jika sudah ada jawaban sebelumnya, highlight
  const prevAnswer = answers[currentQuestionIndex];
  if (prevAnswer !== undefined && prevAnswer !== null) {
    const selectedIndex = (typeof prevAnswer === 'number') ? prevAnswer : prevAnswer.index;
    if (optionButtons[selectedIndex]) optionButtons[selectedIndex].classList.add('selected');
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);

  // ✅ coba restore
  const restored = loadState();
  if (restored) {
    // pastikan tombol navigasi ada
    const card = document.querySelector(".card");
    if (!document.getElementById("nextBtn")) {
      card.insertAdjacentHTML('beforeend', `
        <div class="btn-config">
          <button id="prevBtn">Previous</button>
          <button id="nextBtn">Next</button>
        </div>
      `);

      // pasang listener lagi
      const nextBtn = document.getElementById("nextBtn");
      const prevBtn = document.getElementById("prevBtn");

      nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          saveState();
          updateQuestion();
        } else {
          saveState();
          goTo("result");
        }
      });

      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          saveState();
          updateQuestion();
        }
      });
    }

    updateQuestion(); // render pertanyaan terakhir yang tersimpan
  }
});


startBtn.addEventListener("click", () => {
  bgm.muted = false;
  bgm.volume = 1;      // pastikan > 0
  bgm.currentTime = 0;
  bgm.play()
    .then(() => console.log("Audio playing"))
    .catch(err => console.error(err));
  currentQuestionIndex = 0;

  // tambahkan btn-config di bawah card-quiz
  const card = document.querySelector(".card");
  card.insertAdjacentHTML('beforeend', `
    <div class="btn-config">
      <button id="prevBtn">Previous</button>
      <button id="nextBtn">Next</button>
    </div>
  `);
  console.log("Tombol navigasi ditambahkan ke card");

  updateQuestion();

  // Event listener untuk tombol Next
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      saveState();      // ✅ simpan progress
      updateQuestion();
    } else {
      // Jika sudah pertanyaan terakhir, pindah ke result
      // Data akan dihapus oleh result.js setelah digunakan
      goTo("result");
    }
  });

  // Event listener untuk tombol Previous
  const prevBtn = document.getElementById("prevBtn");
  prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      saveState();      // ✅ simpan progress
      updateQuestion();
    }
  });
});
