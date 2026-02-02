const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });

const fileInput = document.getElementById("fileInput");
const scaleRange = document.getElementById("scaleRange");
const rotateRange = document.getElementById("rotateRange");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

let twibbon = new Image();

function waitForResultData() {
  return new Promise(resolve => {
    const check = () => {
      if (window.RESULT_DATA) return resolve(window.RESULT_DATA);
      requestAnimationFrame(check);
    };
    check();
  });
}

(async () => {
  const result = await waitForResultData();

  console.log("Result dari API:", result);

  // normalisasi ke lowercase
  const partner = result.partner.toLowerCase();

  twibbon.src = `/assets/img/twibbon-${partner}.png`;
})();


// ====== SETUP TEMPLATE (twibbon overlay) ======
//const twibbon = new Image();
//twibbon.src = "../../assets/img/twibbon.png"; // pastikan file ini ada (PNG transparan)

const backgroundImg = new Image();
backgroundImg.src = "../../assets/img/template.png"; // foto background dari dev

let userImg = null;

// Transform state for user image
const state = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  scale: Number(scaleRange.value),
  rotation: degToRad(Number(rotateRange.value)),
};

function degToRad(d) { return (d * Math.PI) / 180; }

// ====== DRAW ======
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background optional (biar nggak transparan)
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1) draw background photo (behind everything)
  if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  }

  // 2) draw user photo (middle)
  if (userImg) {
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate(state.rotation);

    const w = userImg.width * state.scale;
    const h = userImg.height * state.scale;

    // gambar dari tengah
    ctx.drawImage(userImg, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else {
    // placeholder teks
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Upload foto user untuk mulai", canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }

  // 3) draw twibbon overlay (front)
  if (twibbon.complete && twibbon.naturalWidth > 0) {
    ctx.drawImage(twibbon, 0, 0, canvas.width, canvas.height);
  }
}

// ====== LOAD USER IMAGE ======
fileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    userImg = img;

    // auto-fit user image to canvas (cover)
    const scaleToCover = Math.max(canvas.width / img.width, canvas.height / img.height);
    state.scale = scaleToCover;
    scaleRange.value = clamp(scaleToCover, Number(scaleRange.min), Number(scaleRange.max));

    state.x = canvas.width / 2;
    state.y = canvas.height / 2;

    state.rotation = 0;
    rotateRange.value = "0";

    draw();
  };
  img.src = URL.createObjectURL(file);
});

// ====== UI CONTROLS ======
scaleRange.addEventListener("input", () => {
  state.scale = Number(scaleRange.value);
  draw();
});

rotateRange.addEventListener("input", () => {
  state.rotation = degToRad(Number(rotateRange.value));
  draw();
});

resetBtn.addEventListener("click", () => {
  if (!userImg) return;
  const scaleToCover = Math.max(canvas.width / userImg.width, canvas.height / userImg.height);
  state.scale = scaleToCover;
  scaleRange.value = clamp(scaleToCover, Number(scaleRange.min), Number(scaleRange.max));
  state.x = canvas.width / 2;
  state.y = canvas.height / 2;
  state.rotation = 0;
  rotateRange.value = "0";
  draw();
});

downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "twibbon.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ====== DRAG (pointer events) ======
let isDragging = false;
let lastPointer = null;

// pinch-to-zoom
let activePointers = new Map();
let pinchStartDist = 0;
let pinchStartScale = 1;

canvas.addEventListener("pointerdown", (ev) => {
  canvas.setPointerCapture(ev.pointerId);
  activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

  if (!userImg) return;

  if (activePointers.size === 1) {
    isDragging = true;
    lastPointer = { x: ev.clientX, y: ev.clientY };
  } else if (activePointers.size === 2) {
    // start pinch
    const pts = [...activePointers.values()];
    pinchStartDist = dist(pts[0], pts[1]);
    pinchStartScale = state.scale;
    isDragging = false;
  }
});

canvas.addEventListener("pointermove", (ev) => {
  if (!userImg) return;

  if (activePointers.has(ev.pointerId)) {
    activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  }

  if (activePointers.size === 1 && isDragging && lastPointer) {
    const dx = ev.clientX - lastPointer.x;
    const dy = ev.clientY - lastPointer.y;

    // convert screen dx/dy to canvas units (because canvas scaled via CSS)
    const { sx, sy } = screenToCanvasDelta(dx, dy);
    state.x += sx;
    state.y += sy;

    lastPointer = { x: ev.clientX, y: ev.clientY };
    draw();
  }

  if (activePointers.size === 2) {
    const pts = [...activePointers.values()];
    const d = dist(pts[0], pts[1]);

    const ratio = d / pinchStartDist;
    const newScale = pinchStartScale * ratio;

    state.scale = clamp(newScale, Number(scaleRange.min), Number(scaleRange.max));
    scaleRange.value = String(state.scale);
    draw();
  }
});

canvas.addEventListener("pointerup", (ev) => {
  activePointers.delete(ev.pointerId);
  if (activePointers.size === 0) {
    isDragging = false;
    lastPointer = null;
  }
});

canvas.addEventListener("pointercancel", (ev) => {
  activePointers.delete(ev.pointerId);
  if (activePointers.size === 0) {
    isDragging = false;
    lastPointer = null;
  }
});

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function screenToCanvasDelta(dx, dy) {
  // canvas ditampilkan dengan CSS scaling; mapping delta layar -> delta koordinat canvas
  const rect = canvas.getBoundingClientRect();
  const sx = (dx * canvas.width) / rect.width;
  const sy = (dy * canvas.height) / rect.height;
  return { sx, sy };
}

// redraw when template loaded
twibbon.onload = () => draw();
backgroundImg.onload = () => draw();
draw();
