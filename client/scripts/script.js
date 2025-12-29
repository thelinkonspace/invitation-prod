import { goTo } from "../scripts/core.js";

const dots = document.getElementById("dots");
let count = 1;

setInterval(() => {
  dots.textContent = ".".repeat(count);
  count = (count % 3) + 1;
}, 400);

setTimeout(() => {
  goTo("landing");
}, 5000);