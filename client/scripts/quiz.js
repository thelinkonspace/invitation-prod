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
      { text: "Tetap tenang dan analisis situasi", companion: 1 },
      { text: "Cari perlindungan segera", companion: 2 },
      { text: "Hubungi pusat komando untuk bantuan", companion: 3 },
      { text: "Gunakan alat navigasi untuk menemukan jalan keluar", companion: 4 }
    ]
  },
  {
    question: "Partner ideal menurutmu adalah seseorang yang…",
    options: [
      { text: "Selalu ada di sisimu tanpa banyak bicara", companion: 1 },
      { text: "Memberimu rasa aman dan stabilitas", companion: 2 },
      { text: "Membuat hidup terasa lebih hidup dan berwarna", companion: 3 },
      { text: "Mendorongmu menjadi versi terkuat dari dirimu", companion: 4 }
    ]
  },
  {
    question: "Setelah misi selesai dan kamu terluka, apa yang kamu harapkan dari partnermu?",
    options: [
      { text: "Menemanimu diam-diam sampai kamu tertidur", companion: 1 },
      { text: "Merawatmu dengan teliti dan penuh perhatian", companion: 2 },
      { text: "Menghiburmu agar kamu lupa rasa sakit", companion: 3 },
      { text: "Meyakinkanmu bahwa kamu tidak boleh jatuh di medan perang", companion: 4 }
    ]
  },
  {
    question: "Dalam tim Deepspace Hunter, peran apa yang paling cocok untukmu?",
    options: [
      { text: "Pelindung garis depan", companion: 1 },
      { text: "Perencana dan pengambil keputusan", companion: 2 },
      { text: "Pendukung fleksibel yang bisa menyesuaikan situasi", companion: 3 },
      { text: "Pemimpin lapangan yang tegas", companion: 4 }
    ]
  },
  {
    question: "Jika partnermu menyembunyikan rahasia besar, kamu akan…",
    options: [
      { text: "Menunggu sampai dia siap bercerita", companion: 1 },
      { text: "Menghadapinya secara langsung dan rasional", companion: 2 },
      { text: "Menggoda atau bercanda untuk mencairkan suasana", companion: 3 },
      { text: "Memaksa kebenaran keluar, apa pun risikonya", companion: 4 }
    ]
  },  
  {
    question: "Bagaimana caramu menunjukkan rasa sayang?",
    options: [
      { text: "Lewat tindakan kecil tanpa banyak kata", companion: 1 },
      { text: "Dengan perhatian konsisten dan tanggung jawab", companion: 2 },
      { text: "Lewat kata-kata, sentuhan, dan ekspresi emosional", companion: 3 },
      { text: "Dengan proteksi dan posesivitas", companion: 4 }
    ]
  },
  {
    question: "Saat dunia terasa terlalu kejam, apa yang paling kamu butuhkan?",
    options: [
      { text: "Seseorang yang memahami diam-mu", companion: 1 },
      { text: "Seseorang yang bisa diandalkan sepenuhnya", companion: 2 },
      { text: "Seseorang yang membuatmu tersenyum lagi", companion: 3 },
      { text: "Seseorang yang berkata, “Berdiri. Kita lawan.”", companion: 4 }
    ]
  },
  {
    question: "Dalam hubungan, kamu paling takut pada…",
    options: [
      { text: "Ditinggalkan tanpa penjelasan", companion: 1 },
      { text: "Kehilangan orang yang kamu lindungi", companion: 2 },
      { text: "Hubungan yang terasa hambar", companion: 3 },
      { text: "Kehilangan kendali dan kekuatan", companion: 4 }
    ]
  },
  {
    question: "Jika harus memilih, kamu lebih menghargai partner yang…",
    options: [
      { text: "Setia meski tak banyak menuntut", companion: 1 },
      { text: "Selalu memprioritaskan keselamatanmu", companion: 2 },
      { text: "Jujur pada perasaannya", companion: 3 },
      { text: "Tidak ragu mengotori tangannya demi kamu", companion: 4 }
    ]
  },
  {
    question: "Kalimat mana yang paling kamu harapkan diucapkan partnermu?",
    options: [
      { text: "“Aku di sini. Kamu tidak sendirian.”", companion : 1 },
      { text: "“Serahkan padaku, aku akan menjagamu.”", companion: 2 },
      { text: "“Selama kita bersama, semuanya akan baik-baik saja.”", companion: 3 },
      { text: "“Dunia boleh melawanmu, tapi aku tidak.”", companion: 4 }
    ]
  }
];

let currentQuestionIndex = 0;
let answers = []; // untuk menyimpan jawaban
let shuffles = []; // menyimpan urutan acak per pertanyaan (persistent per sesi)

// Fisher–Yates shuffle (in-place)
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STORAGE_KEY = "quiz_state_v1";
const STATE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 jam

function saveState() {
  const state = {
    currentQuestionIndex,
    answers,
    shuffles,
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

    answers = state.answers || [];

    // Restore shuffles (validate expected structure)
    shuffles = Array.isArray(state.shuffles) ? state.shuffles.map((s, i) => {
      if (!Array.isArray(s)) return undefined;
      const expectedLen = questions[i] && questions[i].options ? questions[i].options.length : 0;
      if (s.length !== expectedLen) return undefined;
      return s.map(n => Number(n));
    }) : [];

    // Normalize legacy answers (number -> {index, companion}) and ensure objects include companion when possible
    answers = answers.map((a, i) => {
      if (a === undefined || a === null) return a;
      if (typeof a === 'object' && a.index !== undefined) {
        // if object has points but not companion, copy it over
        if (a.companion === undefined && Number.isFinite(a.points)) a.companion = a.points;
        return a; // already modern shape
      }
      if (typeof a === 'number') {
        const idx = a;
        const q = questions[i];
        const opt = q && q.options && q.options[idx];
        const comp = opt && (typeof opt === 'object' ? (opt.companion || opt.points || 0) : 0);
        return { index: idx, companion: comp };
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

// Helper: hitung berapa pertanyaan yang belum dijawab
function countUnanswered() {
  const total = questions.length;
  let unanswered = 0;
  for (let i = 0; i < total; i++) {
    const a = answers[i];
    if (a === undefined || a === null) unanswered++;
  }
  return unanswered;
}

// Helper: apakah semua pertanyaan sudah dijawab?
function allAnswered() {
  return countUnanswered() === 0;
}

// Fungsi untuk update pertanyaan
function updateQuestion() {
  const q = questions[currentQuestionIndex];
  // Determine per-question order (persistent per-session)
  const optionCount = q.options.length;
  let order = shuffles[currentQuestionIndex];
  let generatedOrder = false;
  if (!Array.isArray(order) || order.length !== optionCount) {
    order = Array.from({ length: optionCount }, (_, i) => i);
    shuffleArray(order);
    shuffles[currentQuestionIndex] = order;
    generatedOrder = true;
  }

  cardQuiz.innerHTML = `
    <div class="card-caption">${q.question}</div>
    <div class="card-options">
      ${order.map((origIdx) => {
        const option = q.options[origIdx];
        const text = typeof option === 'string' ? option : option.text;
        const companion = typeof option === 'string' ? 0 : (option.companion || option.points || 0);
        return `<button class="btn-card" type="button" data-original-index="${origIdx}" data-companion="${companion}">${text}</button>`
      }).join('')}
    </div>
  `;

  // If we created a new order, persist it immediately
  if (generatedOrder) saveState();

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
      const origIdx = Number(btn.dataset.originalIndex);
      const comp = Number(btn.dataset.companion);
      answers[currentQuestionIndex] = { index: origIdx, companion: comp }; // simpan object jawaban (menggunakan original index)

      // Opsional: highlight tombol yang dipilih
      optionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      saveState(); // ✅ simpan tiap klik jawaban
    });
  });

  // Jika sudah ada jawaban sebelumnya, highlight by original index
  const prevAnswer = answers[currentQuestionIndex];
  if (prevAnswer !== undefined && prevAnswer !== null) {
    const storedIndex = (typeof prevAnswer === 'number') ? prevAnswer : prevAnswer.index;
    const btnToSelect = Array.from(optionButtons).find(b => Number(b.dataset.originalIndex) === storedIndex);
    if (btnToSelect) btnToSelect.classList.add('selected');
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
          // Cek apakah semua pertanyaan sudah dijawab sebelum finish
          const remaining = countUnanswered();
          if (remaining > 0) {
            window.alert(`Silakan jawab semua pertanyaan sebelum melihat hasil. Masih ada ${remaining} pertanyaan yang belum dijawab.`);
            return;
          }

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

  // clear previous answers/shuffles for a fresh start
  answers = [];
  shuffles = [];
  saveState();

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
      // Jika sudah pertanyaan terakhir, cek dulu apakah semua sudah dijawab
      const remaining = countUnanswered();
      if (remaining > 0) {
        window.alert(`Silakan jawab semua pertanyaan sebelum melihat hasil. Masih ada ${remaining} pertanyaan yang belum dijawab.`);
        return;
      }

      // Data akan dihapus oleh result.js setelah digunakan
      saveState();
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
