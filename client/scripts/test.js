import { goTo } from "./core.js";

const popup = document.getElementById("popup");
const form = document.getElementById("welcomeForm");

window.addEventListener("load", () => {
  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);
});

const rand = (min, max) => Math.random() * (max - min) + min;

function spawnAtom(x, y) {
  const atom = document.createElement("div");
  atom.className = "atom";
  atom.style.setProperty("--x", x + "px");
  atom.style.setProperty("--y", y + "px");

  // bikin 3 orbit dengan tilt berbeda & speed berbeda
  const tilts = [rand(-25, 25), rand(35, 80), rand(-80, -35)];
  const durs  = [rand(0.55, 0.85), rand(0.75, 1.15), rand(0.9, 1.35)];

  atom.innerHTML = `
    <div class="bloom"></div>
    <div class="nucleus"></div>

    <div class="orbit o1" style="--tilt:${tilts[0]}deg">
      <div class="spinner" style="--dur:${durs[0]}s">
        <div class="electron"></div>
      </div>
    </div>

    <div class="orbit o2" style="--tilt:${tilts[1]}deg">
      <div class="spinner" style="--dur:${durs[1]}s">
        <div class="electron"></div>
      </div>
    </div>

    <div class="orbit o3" style="--tilt:${tilts[2]}deg">
      <div class="spinner" style="--dur:${durs[2]}s">
        <div class="electron"></div>
      </div>
    </div>
  `;

  document.body.appendChild(atom);

  // auto remove setelah anim selesai
  setTimeout(() => atom.remove(), 1400);
}

// klik / tap
window.addEventListener("pointerdown", (e) => {
  spawnAtom(e.clientX, e.clientY);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    username: form.username.value.trim().replace(/^@/, ""), // opsional: buang '@'
    oc_name: form.ocName.value.trim(),
    code_ref: form.refCode.value.trim(),
  };

  if (!payload.username || !payload.oc_name || !payload.code_ref) {
    alert("Mohon isi semua field.");
    return;
  }

  try {
    const res = await fetch("/api/add_candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      // pesan dari backend kamu: result.message
      alert(result.message);
      return;
    }

    console.log("SUCCESS:", result);

    // kalau sukses: tutup popup + lanjut ke quiz
    popup.classList.remove("show");
    goTo("quiz");

  } catch (err) {
    console.error(err);
    alert("Network error. Coba lagi.");
  }
});
