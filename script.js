const themeToggle = document.querySelector(".theme-toggle");
const icon = themeToggle.querySelector("i");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  icon.classList.toggle("bi-moon");
  icon.classList.toggle("bi-sun");
});

let workTime = 60 * 60; 
let remainingTime = workTime;
let timer = null;
let running = false;

const display = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("restart");

function updateDisplay() {
  const min = Math.floor(remainingTime / 60);
  const sec = remainingTime % 60;
  display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function startTimer() {
  if (running) return;
  running = true;
  timer = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateDisplay();
    } else {
      clearInterval(timer);
      running = false;
      alert("Vai dar uma voltinha");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
}

function resetTimer() {
  clearInterval(timer);
  remainingTime = workTime;
  running = false;
  updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
