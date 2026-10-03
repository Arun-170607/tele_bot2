/**
 * PlaceBot - Main Global JavaScript (main.js)
 * Utilities, Audio Synthesizer, Storage Initializer & Navbar
 */

// Initialize default mock data in localStorage if empty
(function initPlaceBotStorage() {
  const defaultUserData = {
    username: "Alex Rivera",
    college: "Institute of Technology",
    targetCompany: "TCS / Infosys / Amazon",
    streakDays: 5,
    level: 3,
    levelTitle: "Placement Ready Associate",
    totalSolved: 142,
    totalTests: 8,
    overallAccuracy: 78,
    categories: {
      aptitude: { solved: 48, correct: 38, totalAvailable: 150 },
      reasoning: { solved: 36, correct: 29, totalAvailable: 120 },
      verbal: { solved: 26, correct: 21, totalAvailable: 100 },
      technical: { solved: 32, correct: 23, totalAvailable: 180 }
    },
    testHistory: [
      { id: "TEST-108", title: "All-Round Placement Mock 1", date: "Yesterday", score: 80, total: 10, accuracy: "80%", status: "Passed" },
      { id: "TEST-107", title: "TCS Technical & SQL Assessment", date: "3 days ago", score: 70, total: 10, accuracy: "70%", status: "Passed" },
      { id: "TEST-106", title: "Quantitative Aptitude Sprint", date: "5 days ago", score: 90, total: 10, accuracy: "90%", status: "Distinction" },
      { id: "TEST-105", title: "Logical Reasoning Diagnostic", date: "1 week ago", score: 60, total: 10, accuracy: "60%", status: "Needs Practice" }
    ]
  };

  if (!localStorage.getItem("placebot_profile")) {
    localStorage.setItem("placebot_profile", JSON.stringify(defaultUserData));
  }
})();

// Web Audio API Telegram Sound Synthesizer (No external mp3 required!)
const PlaceBotAudio = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  },

  playTelegramPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  playSuccessDing() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch (e) {}
  },

  playWrongBuzz() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }
};

// Global helper to format time
function getFormattedCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  return `${hours}:${minutes} ${ampm}`;
}

// Interactive Preview on Landing Page (if elements exist)
document.addEventListener("DOMContentLoaded", () => {
  const landingBtns = document.querySelectorAll(".preview-btn");
  landingBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      landingBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      PlaceBotAudio.playTelegramPop();
    });
  });
});
