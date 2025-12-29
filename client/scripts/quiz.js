import { goTo } from "../scripts/core.js";

const popup = document.getElementById("popup");
const startBtn = document.getElementById("startBtn");
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
    });
  });

  // Jika sudah ada jawaban sebelumnya, highlight
  if (answers[currentQuestionIndex] !== undefined) {
    optionButtons[answers[currentQuestionIndex]].classList.add('selected');
  }
}

window.addEventListener("load", () => {
  // muncul "pop up" setelah page tampil
  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);
});

startBtn.addEventListener("click", () => {
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
      updateQuestion();
    } else {
      // Jika sudah pertanyaan terakhir, pindah ke result
      // window.location.href = "/pages/result/";
      goTo("result");
    }
  });

  // Event listener untuk tombol Previous
  const prevBtn = document.getElementById("prevBtn");
  prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateQuestion();
    }
  });
});
