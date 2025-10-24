const $ = (sel) => document.querySelector(sel);

const themeToggle = $(".theme-toggle");
const settingsToggle = $(".settings-toggle");
const settingsMenu = $("#settingsMenu");
const themeIcon = themeToggle?.querySelector("i");
const modeDisplay = $("#modeDisplay");
const display = $("#timer");
const timerWrap = $("#timerWrap");
const hourglass = $("#hourglass");

const startBtn = $("#start");
const pauseBtn = $("#pause");
const restartBtn = $("#restart");
const modeButtons = document.querySelectorAll(".mode-btn");

// Inputs
const workTimeInput = $("#workTime");
const shortBreakInput = $("#shortBreak");
const longBreakInput = $("#longBreak");
const applySettingsBtn = $(".apply-settings");

const visualCircleRadio = $("#visualCircle");
const visualHourglassRadio = $("#visualHourglass");

try {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeIcon?.classList?.replace("bi-moon", "bi-sun");
  }
} catch {}

themeToggle?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  themeIcon?.classList?.toggle("bi-moon");
  themeIcon?.classList?.toggle("bi-sun");
  try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch {}
});

settingsToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsMenu?.classList?.toggle("active");
  settingsMenu?.setAttribute(
    "aria-hidden",
    settingsMenu?.classList?.contains("active") ? "false" : "true"
  );
});
document.addEventListener("click", (e) => {
  if (!settingsMenu?.contains(e.target) && !settingsToggle?.contains(e.target)) {
    settingsMenu?.classList?.remove("active");
    settingsMenu?.setAttribute("aria-hidden", "true");
  }
});

let times = loadTimesFromStorage() || { work: 25, shortBreak: 5, longBreak: 15 };
applyTimesToInputs(times);

let currentMode = "work";
let baseSeconds = times[currentMode] * 60;
let remainingSeconds = baseSeconds;

let visual = loadVisualFromStorage() || "circle"; 
let intervalId = null;
let running = false;

function two(n) { return String(n).padStart(2, "0"); }

function updateDisplay() {
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  if (display) display.textContent = `${two(min)}:${two(sec)}`;
  if (visual === "circle") updateProgress();
}

function updateModeDisplay() {
  const names = { work: "WorkTime", shortBreak: "Short Break", longBreak: "Long Break" };
  if (modeDisplay) modeDisplay.textContent = names[currentMode];
}

function saveTimesToStorage() {
  try { localStorage.setItem("pomodoro_times", JSON.stringify(times)); } catch {}
}
function loadTimesFromStorage() {
  try {
    const raw = localStorage.getItem("pomodoro_times");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveVisualToStorage(v) {
  try { localStorage.setItem("pomodoro_visual", v); } catch {}
}
function loadVisualFromStorage() {
  try { return localStorage.getItem("pomodoro_visual"); } catch { return null; }
}
function applyTimesToInputs(t) {
  if (workTimeInput) workTimeInput.value = t.work;
  if (shortBreakInput) shortBreakInput.value = t.shortBreak;
  if (longBreakInput) longBreakInput.value = t.longBreak;
}

function applyVisual(v) {
  visual = v === "hourglass" ? "hourglass" : "circle";
  saveVisualToStorage(visual);

  if (visualCircleRadio) visualCircleRadio.checked = visual === "circle";
  if (visualHourglassRadio) visualHourglassRadio.checked = visual === "hourglass";

  document.body.classList.toggle("ui-circle", visual === "circle");
  document.body.classList.toggle("ui-hourglass", visual === "hourglass");

  timerWrap?.setAttribute("aria-hidden", visual === "hourglass" ? "true" : "false");
  hourglass?.setAttribute("aria-hidden", visual === "hourglass" ? "false" : "true");

  updateDisplay(); 
}

applyVisual(visual);
updateModeDisplay();
updateDisplay();

document.querySelectorAll(".btn-increase").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const input = target === "work" ? workTimeInput : (target === "shortBreak" ? shortBreakInput : longBreakInput);
    if (!input) return;
    input.value = Math.min(parseInt(input.value || "0", 10) + 1, parseInt(input.max, 10));
  });
});
document.querySelectorAll(".btn-decrease").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const input = target === "work" ? workTimeInput : (target === "shortBreak" ? shortBreakInput : longBreakInput);
    if (!input) return;
    input.value = Math.max(parseInt(input.value || "0", 10) - 1, parseInt(input.min, 10));
  });
});

applySettingsBtn?.addEventListener("click", () => {
  const w = clampInt(workTimeInput?.value, 1, 120);
  const s = clampInt(shortBreakInput?.value, 1, 30);
  const l = clampInt(longBreakInput?.value, 1, 60);
  times = { work: w, shortBreak: s, longBreak: l };
  saveTimesToStorage();

  const chosenVisual = visualHourglassRadio?.checked ? "hourglass" : "circle";
  applyVisual(chosenVisual);

  if (!running) {
    baseSeconds = times[currentMode] * 60;
    remainingSeconds = baseSeconds;
    updateDisplay();
  }

  settingsMenu?.classList?.remove("active");
  settingsMenu?.setAttribute("aria-hidden", "true");
  alert("Settings Changed");
});

function clampInt(v, min, max) {
  const n = parseInt(v ?? "", 10);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function startTimer() {
  if (running) return;
  running = true;
  if (startBtn) startBtn.disabled = true;
  document.body.classList.add("timer-running");

  intervalId = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
      return;
    }
    clearInterval(intervalId);
    running = false;
    if (startBtn) startBtn.disabled = false;
    document.body.classList.remove("timer-running");

    alert(currentMode === "work"
      ? "Vai passear"
      : "Vem trabalhar");
  }, 1000);
}
function pauseTimer() {
  if (!running) return;
  clearInterval(intervalId);
  running = false;
  if (startBtn) startBtn.disabled = false;
  document.body.classList.remove("timer-running");
}
function restartTimer() {
  clearInterval(intervalId);
  running = false;
  if (startBtn) startBtn.disabled = false;
  remainingSeconds = baseSeconds;
  updateDisplay();
  document.body.classList.remove("timer-running");
}

startBtn?.addEventListener("click", startTimer);
pauseBtn?.addEventListener("click", pauseTimer);
restartBtn?.addEventListener("click", restartTimer);

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (running) { alert("Para o timer antes de alterar o modo"); return; }

    modeButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    currentMode = btn.getAttribute("data-mode");
    baseSeconds = times[currentMode] * 60;
    remainingSeconds = baseSeconds;
    updateModeDisplay();
    updateDisplay();
  });
});

function updateProgress() {
  const progress = baseSeconds === 0 ? 0 : ((baseSeconds - remainingSeconds) / baseSeconds) * 100;
  timerWrap?.style?.setProperty("--p", progress);
  if (remainingSeconds <= 60 && currentMode === "work") {
    timerWrap?.classList?.add("almost-done");
  } else {
    timerWrap?.classList?.remove("almost-done");
  }
}
