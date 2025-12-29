const popup = document.getElementById("popup");
const form = document.getElementById("welcomeForm");

window.addEventListener("load", () => {
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

  // contoh: tutup popup
  popup.classList.remove("show");

});
