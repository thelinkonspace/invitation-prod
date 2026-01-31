import { goTo } from "../scripts/core.js";

const popup = document.getElementById("popup");
const form = document.getElementById("welcomeForm");

window.addEventListener("load", () => {
  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
  }, 120);
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
    if (result.success) {
      sessionStorage.setItem("session_token", result.data.session_token);
      popup.classList.remove("show");
      goTo("quiz");
    }

  } catch (err) {
    console.error(err);
    alert("Network error. Coba lagi.");
  }
});
