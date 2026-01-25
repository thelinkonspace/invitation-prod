import { goTo } from "../scripts/core.js";

const popup = document.getElementById("popup");
const startBtn = document.getElementById("startBtn");
const bgm = document.getElementById("bgm");
const cardQuiz = document.querySelector(".card-quiz");

// Array pertanyaan
const questions = [
  {
    question: "Saat misi berbahaya dan sinyal komunikasi terputus, apa yang pertama kali kamu lakukan?",
    options: ["Tetap tenang dan analisis situasi", "Cari perlindungan segera", "Hubungi pusat komando untuk bantuan", "Gunakan alat navigasi untuk menemukan jalan keluar"]
  },
  {
    question: "Partner ideal menurutmu adalah seseorang yang…",
    options: ["Selalu ada di sisimu tanpa banyak bicara", "Memberimu rasa aman dan stabilitas", "Membuat hidup terasa lebih hidup dan berwarna", "Mendorongmu menjadi versi terkuat dari dirimu"]
  },
  {
    question: "Setelah misi selesai dan kamu terluka, apa yang kamu harapkan dari partnermu?",
    options: ["Menemanimu diam-diam sampai kamu tertidur", "Merawatmu dengan teliti dan penuh perhatian", "Menghiburmu agar kamu lupa rasa sakit", "Meyakinkanmu bahwa kamu tidak boleh jatuh di medan perang"]
  },
  {
    question: "Dalam tim Deepspace Hunter, peran apa yang paling cocok untukmu?",
    options: ["Pelindung garis depan", "Perencana dan pengambil keputusan", "Pendukung fleksibel yang bisa menyesuaikan situasi", "Pemimpin lapangan yang tegas"]
  },
  {
    question: "Jika partnermu menyembunyikan rahasia besar, kamu akan…",
    options: ["Menunggu sampai dia siap bercerita", "Menghadapinya secara langsung dan rasional", "Menggoda atau bercanda untuk mencairkan suasana", "Memaksa kebenaran keluar, apa pun risikonya"]
  },  
  {
    question: "Bagaimana caramu menunjukkan rasa sayang?",
    options: ["Lewat tindakan kecil tanpa banyak kata", "Dengan perhatian konsisten dan tanggung jawab", "Lewat kata-kata, sentuhan, dan ekspresi emosional", "Dengan proteksi dan posesivitas"]  
  },
  {
    question: "Saat dunia terasa terlalu kejam, apa yang paling kamu butuhkan?",
    options: ["Seseorang yang memahami diam-mu", "Seseorang yang bisa diandalkan sepenuhnya", "Seseorang yang membuatmu tersenyum lagi", "Seseorang yang berkata, “Berdiri. Kita lawan.”"]  
  },
  {
    question: "Dalam hubungan, kamu paling takut pada…",
    options: ["Ditinggalkan tanpa penjelasan", "Kehilangan orang yang kamu lindungi", "Hubungan yang terasa hambar", "Kehilangan kendali dan kekuatan"]  
  },
  {
    question: "Jika harus memilih, kamu lebih menghargai partner yang…",
    options: ["Setia meski tak banyak menuntut", "Selalu memprioritaskan keselamatanmu", "Jujur pada perasaannya", "Tidak ragu mengotori tangannya demi kamu"]  
  },
  {
    question: "Kalimat mana yang paling kamu harapkan diucapkan partnermu?",
    options: ["“Aku di sini. Kamu tidak sendirian.”", "“Serahkan padaku, aku akan menjagamu.”", "“Selama kita bersama, semuanya akan baik-baik saja.”", "“Dunia boleh melawanmu, tapi aku tidak.”"]  
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
  cardQuiz.innerHTML = `
    <div class="card-caption">${q.question}</div>
    <div class="card-options">
      ${q.options.map(option => `<button class="btn-card" type="button">${option}</button>`).join('')}
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
  optionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      answers[currentQuestionIndex] = index; // simpan index opsi yang dipilih
      // Opsional: highlight tombol yang dipilih
      optionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      saveState(); // ✅ simpan tiap klik jawaban
    });
  });

  // Jika sudah ada jawaban sebelumnya, highlight
  if (answers[currentQuestionIndex] !== undefined) {
    optionButtons[answers[currentQuestionIndex]].classList.add('selected');
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
