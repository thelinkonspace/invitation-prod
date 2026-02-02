import { goTo } from "../scripts/core.js";

const popup = document.getElementById("popup");
const form = document.getElementById("welcomeForm");
const loader = document.querySelector(".loader");

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.display = "none";
    loader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";  
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loader.style.display = "grid";
  loader.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const payload = {
    username: form.username.value.trim().replace(/^@/, ""), // opsional: buang '@'
    oc_name: form.ocName.value.trim(),
    code_ref: form.refCode.value.trim(),
  };

  if (!payload.username || !payload.oc_name || !payload.code_ref) {
    alert("Mohon isi semua field.");
    loader.style.display = "none";
    loader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (submitBtn) submitBtn.disabled = false;
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
      alert(result.message || "Terjadi kesalahan.");
      loader.style.display = "none";
      loader.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    console.log("SUCCESS:", result);

    // kalau sukses: tutup popup + lanjut ke quiz
    if (result.success) {
      sessionStorage.setItem("session_token", result.data.session_token);
      popup.classList.remove("show");
      popup.setAttribute("aria-hidden", "true");
      loader.style.display = "none";
      loader.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      goTo("quiz");
    } else {
      // unexpected: pastikan loader disembunyikan dan tombol diaktifkan kembali
      alert(result.message || "Gagal.");
      loader.style.display = "none";
      loader.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (submitBtn) submitBtn.disabled = false;
    }

  } catch (err) {
    console.error(err);
    alert("Network error. Coba lagi.");
    loader.style.display = "none";
    loader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (submitBtn) submitBtn.disabled = false;
  }
});
