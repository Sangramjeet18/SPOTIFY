/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  MOODIFY — Music Player Engine
 *  Pure vanilla JS · zero dependencies · ES2020+
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

(() => {
  "use strict";

  // ═══════════════════════════════════════════
  //  1. TRACK LIBRARY (swap with API in prod)
  // ═══════════════════════════════════════════
  const TRACKS = [
    {
      id: "t1",
      title: "Midnight Rain",
      artist: "Aurora Skies",
      duration: 225,
      cover:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "t2",
      title: "Blinding Lights",
      artist: "The Weeknd",
      duration: 200,
      cover:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "t3",
      title: "Stargazer",
      artist: "Luna Park",
      duration: 210,
      cover:
        "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "t4",
      title: "Golden Hour",
      artist: "Kacey Rivers",
      duration: 195,
      cover:
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
      id: "t5",
      title: "Heat Waves",
      artist: "Glass Animals",
      duration: 238,
      cover:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
    {
      id: "t6",
      title: "Levitating",
      artist: "Dua Lipa",
      duration: 203,
      cover:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    },
    {
      id: "t7",
      title: "Neon Dreams",
      artist: "Synthwave Collective",
      duration: 260,
      cover:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    },
    {
      id: "t8",
      title: "Electric Feel",
      artist: "MGMT",
      duration: 230,
      cover:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    },
  ];

  // ═══════════════════════════════════════════
  //  2. PLAYER STATE
  // ═══════════════════════════════════════════
  const state = {
    currentIndex: 0,
    isPlaying: false,
    shuffle: false,
    repeat: "off", // 'off' | 'all' | 'one'
    volume: 70,
    previousVolume: 70,
    isMuted: false,
    queue: [...TRACKS],
    shuffledQueue: [],
    history: [],
    animationFrameId: null,
  };

  // ═══════════════════════════════════════════
  //  3. AUDIO ENGINE
  // ═══════════════════════════════════════════
  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = state.volume / 100;

  // ═══════════════════════════════════════════
  //  4. DOM CACHE
  // ═══════════════════════════════════════════
  let dom = {};

  function cacheDom() {
    dom = {
      // Player buttons
      playBtn: document.querySelector(".player__btn--play"),
      prevBtn: document.querySelector('.player__btn[aria-label="Previous track"]'),
      nextBtn: document.querySelector('.player__btn[aria-label="Next track"]'),
      shuffleBtn: document.querySelector('.player__btn[aria-label="Toggle shuffle"]'),
      repeatBtn: document.querySelector('.player__btn[aria-label="Toggle repeat"]'),

      // Progress
      progressBar: document.querySelector(".player__progress-bar"),
      timeElapsed: document.querySelector(".player__progress .player__time:first-child"),
      timeTotal: document.querySelector(".player__progress .player__time:last-child"),

      // Volume
      volumeBar: document.querySelector(".player__volume-bar"),
      volumeBtn: document.querySelector('.player__extra-btn[aria-label="Mute"]'),

      // Song info (player bar)
      songThumb: document.querySelector(".player__song-thumb"),
      songTitle: document.querySelector(".player__song-title"),
      songArtist: document.querySelector(".player__song-artist"),
      likeBtn: document.querySelector(".player__like-btn"),

      // Song cards
      songCards: document.querySelectorAll(".song-card"),
    };
  }

  // ═══════════════════════════════════════════
  //  5. UTILITIES
  // ═══════════════════════════════════════════

  /** Format seconds → "M:SS" */
  function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /** Fisher-Yates shuffle (non-mutating) */
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /** Get the currently active queue */
  function getActiveQueue() {
    return state.shuffle ? state.shuffledQueue : state.queue;
  }

  /** Get the current track object */
  function getCurrentTrack() {
    return getActiveQueue()[state.currentIndex];
  }

  // ═══════════════════════════════════════════
  //  6. UI UPDATE FUNCTIONS
  // ═══════════════════════════════════════════

  /** Update track display in the player bar */
  function updateTrackDisplay() {
    const track = getCurrentTrack();
    if (!track) return;

    dom.songThumb.src = track.cover;
    dom.songThumb.alt = `Now playing: ${track.title} by ${track.artist}`;
    dom.songTitle.textContent = track.title;
    dom.songArtist.textContent = track.artist;

    // Progress bar range
    dom.progressBar.max = track.duration;
    dom.progressBar.value = 0;
    dom.timeElapsed.textContent = "0:00";
    dom.timeTotal.textContent = formatTime(track.duration);

    // Browser tab title
    document.title = `${track.title} — ${track.artist} | Moodify`;

    // Highlight the active card
    updateActiveCard();
  }

  /** Update play/pause button icon and ARIA */
  function updatePlayButton() {
    const icon = dom.playBtn.querySelector("i");
    if (state.isPlaying) {
      icon.className = "icon-pause";
      dom.playBtn.setAttribute("aria-label", "Pause");
    } else {
      icon.className = "icon-play";
      dom.playBtn.setAttribute("aria-label", "Play");
    }
  }

  /** Update shuffle button visual state */
  function updateShuffleButton() {
    dom.shuffleBtn.classList.toggle("player__btn--active", state.shuffle);
    dom.shuffleBtn.setAttribute("aria-pressed", state.shuffle);
  }

  /** Update repeat button visual state and icon */
  function updateRepeatButton() {
    const icon = dom.repeatBtn.querySelector("i");
    const isActive = state.repeat !== "off";

    dom.repeatBtn.classList.toggle("player__btn--active", isActive);

    if (state.repeat === "one") {
      icon.className = "icon-repeat-1";
      dom.repeatBtn.setAttribute("aria-label", "Repeat: one");
    } else {
      icon.className = "icon-repeat";
      dom.repeatBtn.setAttribute(
        "aria-label",
        `Repeat: ${state.repeat}`
      );
    }
  }

  /** Update volume icon based on level */
  function updateVolumeIcon() {
    const icon = dom.volumeBtn.querySelector("i");
    const v = state.isMuted ? 0 : state.volume;

    if (v === 0) icon.className = "icon-volume-x";
    else if (v < 30) icon.className = "icon-volume";
    else if (v < 70) icon.className = "icon-volume-1";
    else icon.className = "icon-volume-2";
  }

  /** Highlight the currently playing song card */
  function updateActiveCard() {
    const track = getCurrentTrack();
    dom.songCards.forEach((card, index) => {
      const isActive = TRACKS[index]?.id === track?.id;
      card.classList.toggle("song-card--active", isActive);

      const playBtnIcon = card.querySelector(".song-card__play-btn svg");
      if (playBtnIcon) {
        if (isActive && state.isPlaying) {
          playBtnIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
        } else {
          playBtnIcon.innerHTML = '<polygon points="5,3 19,12 5,21"/>';
        }
      }
    });
  }

  /** Start requestAnimationFrame loop for smooth progress sync */
  function startProgressSync() {
    stopProgressSync();

    function tick() {
      if (!audio.paused && isFinite(audio.duration)) {
        dom.progressBar.value = audio.currentTime;
        dom.timeElapsed.textContent = formatTime(audio.currentTime);
        styleRangeInput(dom.progressBar);

        // Update ARIA
        dom.progressBar.setAttribute(
          "aria-valuenow",
          Math.floor(audio.currentTime)
        );
        dom.progressBar.setAttribute(
          "aria-valuetext",
          `${formatTime(audio.currentTime)} of ${formatTime(audio.duration)}`
        );
      }
      state.animationFrameId = requestAnimationFrame(tick);
    }

    state.animationFrameId = requestAnimationFrame(tick);
  }

  /** Stop the progress sync loop */
  function stopProgressSync() {
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }
  }

  // ═══════════════════════════════════════════
  //  7. CORE PLAYBACK
  // ═══════════════════════════════════════════

  /** Load a track by queue index (does NOT auto-play) */
  function loadTrack(index) {
    const queue = getActiveQueue();
    if (index < 0 || index >= queue.length) return;

    state.currentIndex = index;
    const track = queue[index];

    audio.src = track.src;
    audio.load();
    updateTrackDisplay();
    updateMediaSession();
  }

  /** Play current track */
  async function play() {
    try {
      await audio.play();
      state.isPlaying = true;
      updatePlayButton();
      updateActiveCard();
      startProgressSync();
    } catch (err) {
      console.warn("Playback prevented:", err.message);
    }
  }

  /** Pause current track */
  function pause() {
    audio.pause();
    state.isPlaying = false;
    updatePlayButton();
    updateActiveCard();
    stopProgressSync();
  }

  /** Toggle play/pause */
  function togglePlayPause() {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }

  /** Advance to the next track */
  function nextTrack() {
    const queue = getActiveQueue();

    // Save current index to history for prev navigation
    state.history.push(state.currentIndex);
    if (state.history.length > 50) state.history.shift();

    let nextIndex = state.currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (state.repeat === "all") {
        nextIndex = 0;
      } else {
        // End of queue, stop playing
        pause();
        loadTrack(0);
        return;
      }
    }

    loadTrack(nextIndex);
    play();
  }

  /** Go to the previous track */
  function prevTrack() {
    // If more than 3 seconds in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      dom.progressBar.value = 0;
      dom.timeElapsed.textContent = "0:00";
      styleRangeInput(dom.progressBar);
      return;
    }

    // Otherwise go back in history
    if (state.history.length > 0) {
      const prevIndex = state.history.pop();
      loadTrack(prevIndex);
    } else {
      // No history — go to previous index or wrap
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.repeat === "all" ? getActiveQueue().length - 1 : 0;
      }
      loadTrack(prevIndex);
    }

    play();
  }

  /** Play a specific track by its ID */
  function playTrackById(id) {
    const queue = getActiveQueue();
    const index = queue.findIndex((t) => t.id === id);
    if (index === -1) return;

    state.history.push(state.currentIndex);
    loadTrack(index);
    play();
  }

  // ═══════════════════════════════════════════
  //  8. SHUFFLE & REPEAT
  // ═══════════════════════════════════════════

  /** Toggle shuffle on/off */
  function toggleShuffle() {
    const currentTrack = getCurrentTrack();
    state.shuffle = !state.shuffle;

    if (state.shuffle) {
      // Create shuffled queue with current track at position 0
      state.shuffledQueue = shuffleArray(state.queue);
      const currentIdx = state.shuffledQueue.findIndex(
        (t) => t.id === currentTrack.id
      );
      if (currentIdx > 0) {
        [state.shuffledQueue[0], state.shuffledQueue[currentIdx]] = [
          state.shuffledQueue[currentIdx],
          state.shuffledQueue[0],
        ];
      }
      state.currentIndex = 0;
    } else {
      // Return to original queue order
      state.currentIndex = state.queue.findIndex(
        (t) => t.id === currentTrack.id
      );
    }

    state.history = [];
    updateShuffleButton();
  }

  /** Cycle repeat mode: off → all → one → off */
  function cycleRepeat() {
    const modes = ["off", "all", "one"];
    const currentModeIndex = modes.indexOf(state.repeat);
    state.repeat = modes[(currentModeIndex + 1) % modes.length];
    updateRepeatButton();
  }

  // ═══════════════════════════════════════════
  //  9. SEEK & VOLUME
  // ═══════════════════════════════════════════

  /** Handle progress bar seek */
  function handleSeek(e) {
    const value = parseFloat(e.target.value);
    audio.currentTime = value;
    dom.timeElapsed.textContent = formatTime(value);
    styleRangeInput(dom.progressBar);
  }

  /** Handle volume slider change */
  function handleVolumeChange(e) {
    const value = parseInt(e.target.value, 10);
    state.volume = value;
    state.isMuted = value === 0;
    audio.volume = value / 100;
    updateVolumeIcon();
    styleRangeInput(dom.volumeBar);
  }

  /** Toggle mute */
  function toggleMute() {
    if (state.isMuted) {
      state.isMuted = false;
      state.volume = state.previousVolume || 70;
    } else {
      state.isMuted = true;
      state.previousVolume = state.volume;
      state.volume = 0;
    }

    audio.volume = state.volume / 100;
    dom.volumeBar.value = state.volume;
    updateVolumeIcon();
    styleRangeInput(dom.volumeBar);
  }

  // ═══════════════════════════════════════════
  //  10. AUDIO EVENT HANDLERS
  // ═══════════════════════════════════════════

  function handleTrackEnded() {
    if (state.repeat === "one") {
      audio.currentTime = 0;
      play();
    } else {
      nextTrack();
    }
  }

  function handleMetadataLoaded() {
    if (isFinite(audio.duration)) {
      const track = getCurrentTrack();
      track.duration = audio.duration;
      dom.progressBar.max = audio.duration;
      dom.timeTotal.textContent = formatTime(audio.duration);
    }
  }

  function handleAudioError(e) {
    console.error("Audio error:", e);
    // Auto-advance to next track after brief delay
    setTimeout(() => nextTrack(), 1000);
  }

  // ═══════════════════════════════════════════
  //  11. MEDIASESSION API (OS-level controls)
  // ═══════════════════════════════════════════

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;

    const track = getCurrentTrack();
    if (!track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "Moodify",
      artwork: [
        { src: track.cover, sizes: "300x300", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
    navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) {
        audio.currentTime = details.seekTime;
      }
    });
  }

  // ═══════════════════════════════════════════
  //  12. KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════

  function handleKeyboard(e) {
    // Skip if user is typing in an input
    const tag = e.target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case " ":
        e.preventDefault();
        togglePlayPause();
        break;

      case "arrowleft":
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
        break;

      case "arrowright":
        e.preventDefault();
        audio.currentTime = Math.min(
          audio.duration || 0,
          audio.currentTime + 5
        );
        break;

      case "arrowup":
        e.preventDefault();
        state.volume = Math.min(100, state.volume + 5);
        state.isMuted = false;
        audio.volume = state.volume / 100;
        dom.volumeBar.value = state.volume;
        updateVolumeIcon();
        styleRangeInput(dom.volumeBar);
        break;

      case "arrowdown":
        e.preventDefault();
        state.volume = Math.max(0, state.volume - 5);
        state.isMuted = state.volume === 0;
        audio.volume = state.volume / 100;
        dom.volumeBar.value = state.volume;
        updateVolumeIcon();
        styleRangeInput(dom.volumeBar);
        break;

      case "m":
        toggleMute();
        break;

      case "s":
        toggleShuffle();
        break;

      case "r":
        cycleRepeat();
        break;

      case "n":
        nextTrack();
        break;

      case "p":
        prevTrack();
        break;
    }
  }

  // ═══════════════════════════════════════════
  //  13. SONG CARD INTERACTIONS
  // ═══════════════════════════════════════════

  function bindSongCards() {
    dom.songCards.forEach((card, index) => {
      const track = TRACKS[index];
      if (!track) return;

      // Click on card body → play
      card.addEventListener("click", (e) => {
        if (e.target.closest(".song-card__play-btn")) return;
        playTrackById(track.id);
      });

      // Click on play button → toggle or switch
      const playBtn = card.querySelector(".song-card__play-btn");
      if (playBtn) {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const current = getCurrentTrack();
          if (current?.id === track.id) {
            togglePlayPause();
          } else {
            playTrackById(track.id);
          }
        });
      }

      // Keyboard: Enter/Space to play
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playTrackById(track.id);
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  14. LIKE BUTTON TOGGLE
  // ═══════════════════════════════════════════

  function bindLikeButton() {
    dom.likeBtn.addEventListener("click", () => {
      const isLiked = dom.likeBtn.classList.toggle("player__like-btn--active");
      const icon = dom.likeBtn.querySelector("i");

      if (isLiked) {
        icon.className = "icon-heart";
        icon.style.color = "#1db954";
        dom.likeBtn.setAttribute("aria-label", "Remove from Liked Songs");
        dom.likeBtn.setAttribute("aria-pressed", "true");
      } else {
        icon.className = "icon-heart";
        icon.style.color = "";
        dom.likeBtn.setAttribute("aria-label", "Save to your Liked Songs");
        dom.likeBtn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // ═══════════════════════════════════════════
  //  15. RANGE INPUT VISUAL FILL
  // ═══════════════════════════════════════════

  function styleRangeInput(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    const accentColor = "#1db954";
    const trackColor = "#404040";

    input.style.background = `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percent}%, ${trackColor} ${percent}%, ${trackColor} 100%)`;
  }

  function initRangeStyles() {
    styleRangeInput(dom.progressBar);
    styleRangeInput(dom.volumeBar);

    // Keep sliders styled on input
    dom.progressBar.addEventListener("input", () =>
      styleRangeInput(dom.progressBar)
    );
    dom.volumeBar.addEventListener("input", () =>
      styleRangeInput(dom.volumeBar)
    );
  }

  // ═══════════════════════════════════════════
  //  16–17. INITIALIZATION & BOOT
  // ═══════════════════════════════════════════

  function init() {
    // Cache DOM references
    cacheDom();

    // ── Button event listeners ──
    dom.playBtn.addEventListener("click", togglePlayPause);
    dom.prevBtn.addEventListener("click", prevTrack);
    dom.nextBtn.addEventListener("click", nextTrack);
    dom.shuffleBtn.addEventListener("click", toggleShuffle);
    dom.repeatBtn.addEventListener("click", cycleRepeat);

    // ── Slider event listeners ──
    dom.progressBar.addEventListener("input", handleSeek);
    dom.volumeBar.addEventListener("input", handleVolumeChange);
    dom.volumeBtn.addEventListener("click", toggleMute);

    // ── Audio event listeners ──
    audio.addEventListener("ended", handleTrackEnded);
    audio.addEventListener("loadedmetadata", handleMetadataLoaded);
    audio.addEventListener("error", handleAudioError);

    // ── Keyboard shortcuts ──
    document.addEventListener("keydown", handleKeyboard);

    // ── Song card interactions ──
    bindSongCards();

    // ── Like button ──
    bindLikeButton();

    // ── Style range inputs ──
    initRangeStyles();

    // ── Set initial UI state ──
    dom.volumeBar.value = state.volume;
    updateVolumeIcon();
    updateShuffleButton();
    updateRepeatButton();

    // ── Load first track (no auto-play) ──
    loadTrack(0);

    // ── Log keyboard shortcuts ──
    console.log(
      "%c🎵 Moodify Keyboard Shortcuts",
      "font-size:14px;font-weight:bold;color:#1db954",
      "\n\nSpace — Play/Pause",
      "\n← → — Seek ±5s",
      "\n↑ ↓ — Volume ±5%",
      "\nM — Mute",
      "\nS — Shuffle",
      "\nR — Repeat",
      "\nN — Next",
      "\nP — Previous"
    );
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();