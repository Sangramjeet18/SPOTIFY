// ===============================
// SELECT ELEMENTS
// ===============================
const playBtn = document.querySelector(".player__btn--play");
const progressBar = document.querySelector(".progress-bar");
const currentTimeEl = document.querySelector(".player__time");
const totalTimeEl = document.querySelector(".player__time--right");
const volumeBar = document.querySelector(".volume-bar");
const likeBtn = document.querySelector(".player__like");

// ===============================
// FAKE SONG DATA
// ===============================
let duration = 200; // total seconds (3:20)
let currentTime = 0;
let isPlaying = false;
let interval;

// ===============================
// FORMAT TIME FUNCTION
// ===============================
function formatTime(sec) {
  let minutes = Math.floor(sec / 60);
  let seconds = sec % 60;
  if (seconds < 10) seconds = "0" + seconds;
  return `${minutes}:${seconds}`;
}

// ===============================
// PLAY FUNCTION
// ===============================
function playSong() {
  isPlaying = true;

  // change icon to pause
  playBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.7 3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1zm12.6 0a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1z"/>
    </svg>
  `;

  interval = setInterval(() => {
    if (currentTime < duration) {
      currentTime++;
      updateProgress();
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

// ===============================
// PAUSE FUNCTION
// ===============================
function pauseSong() {
  isPlaying = false;

  // change icon to play
  playBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
    </svg>
  `;

  clearInterval(interval);
}

// ===============================
// UPDATE PROGRESS
// ===============================
function updateProgress() {
  progressBar.value = currentTime;
  currentTimeEl.textContent = formatTime(currentTime);
}

// ===============================
// PLAY BUTTON CLICK
// ===============================
playBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// ===============================
// SEEK (DRAG PROGRESS BAR)
// ===============================
progressBar.addEventListener("input", () => {
  currentTime = progressBar.value;
  updateProgress();
});

// ===============================
// VOLUME CONTROL
// ===============================
volumeBar.addEventListener("input", () => {
  let volume = volumeBar.value;
  console.log("Volume:", volume);
  // (Real audio would use audio.volume)
});

// ===============================
// LIKE BUTTON TOGGLE
// ===============================
likeBtn.addEventListener("click", () => {
  let liked = likeBtn.getAttribute("aria-pressed") === "true";

  if (liked) {
    likeBtn.setAttribute("aria-pressed", "false");
    likeBtn.style.color = "#b3b3b3";
  } else {
    likeBtn.setAttribute("aria-pressed", "true");
    likeBtn.style.color = "#1db954";
  }
});

// ===============================
// INIT
// ===============================
totalTimeEl.textContent = formatTime(duration);
progressBar.max = duration;