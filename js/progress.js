/**
 * PlaceBot - Student Progress & Preparation Analytics (progress.js)
 * Tracks cumulative statistics, category mastery, placement test history,
 * and AI-style preparation suggestions.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderProgressDashboard();
  initProgressActions();
});

function getProfileData() {
  try {
    const raw = localStorage.getItem("placebot_profile");
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Fallback defaults
  return {
    username: "Alex Rivera",
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
}

function renderProgressDashboard() {
  const profile = getProfileData();

  // Profile Header Card
  const studentNameEl = document.getElementById("progStudentName");
  const streakEl = document.getElementById("progStreakCount");
  const levelTitleEl = document.getElementById("progLevelTitle");
  const totalSolvedEl = document.getElementById("progTotalSolved");
  const testsTakenEl = document.getElementById("progTestsTaken");
  const overallAccEl = document.getElementById("progOverallAccuracy");

  if (studentNameEl) studentNameEl.textContent = profile.username || "Student";
  if (streakEl) streakEl.textContent = `${profile.streakDays || 5} Days`;
  if (levelTitleEl) levelTitleEl.textContent = profile.levelTitle || "Placement Ready";
  if (totalSolvedEl) totalSolvedEl.textContent = profile.totalSolved || 0;
  if (testsTakenEl) testsTakenEl.textContent = profile.totalTests || 0;
  if (overallAccEl) overallAccEl.textContent = `${profile.overallAccuracy || 75}%`;

  // Render Category Bars
  renderCategoryBars(profile.categories);

  // Render Test History Table
  renderTestHistory(profile.testHistory || []);

  // Render PlaceBot Insights
  renderBotInsights(profile);
}

function renderCategoryBars(categories) {
  const container = document.getElementById("progressCategoryBars");
  if (!container || !categories) return;

  const catMeta = {
    aptitude: { label: "Quantitative Aptitude", icon: "bi-calculator", color: "bg-primary" },
    reasoning: { label: "Logical Reasoning", icon: "bi-puzzle", color: "bg-warning" },
    verbal: { label: "Verbal Ability & English", icon: "bi-chat-left-quote", color: "bg-danger" },
    technical: { label: "Technical & Coding (C++/Java/SQL)", icon: "bi-terminal", color: "bg-purple" }
  };

  let html = "";
  for (const [key, data] of Object.entries(categories)) {
    const meta = catMeta[key] || { label: key, icon: "bi-tag", color: "bg-info" };
    const accuracy = data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0;
    const progressPercent = Math.min(100, Math.round((data.solved / (data.totalAvailable || 100)) * 100));

    html += `
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-bold text-dark d-flex align-items-center gap-2">
            <i class="bi ${meta.icon} text-primary"></i> ${meta.label}
          </span>
          <span class="badge bg-light text-dark border">
            ${data.correct}/${data.solved} Correct (${accuracy}% Accuracy)
          </span>
        </div>
        <div class="d-flex justify-content-between text-muted small mb-1">
          <span>Question Bank Coverage</span>
          <span>${data.solved} / ${data.totalAvailable || 100} Solved (${progressPercent}%)</span>
        </div>
        <div class="progress" style="height: 10px; border-radius: 6px;">
          <div class="progress-bar ${accuracy >= 75 ? 'bg-success' : accuracy >= 60 ? 'bg-primary' : 'bg-warning'}" 
               role="progressbar" style="width: ${accuracy}%;"></div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderTestHistory(history) {
  const tbody = document.getElementById("testHistoryTbody");
  if (!tbody) return;

  if (history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          No tests taken yet. Launch the <a href="quiz.html" class="fw-bold text-primary">Mock Test</a> to get your first score!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history.map(t => {
    let badgeClass = "bg-secondary";
    if (t.status === "Distinction") badgeClass = "bg-success";
    else if (t.status === "Passed") badgeClass = "bg-primary";
    else if (t.status === "Needs Practice") badgeClass = "bg-warning text-dark";

    return `
      <tr>
        <td><strong class="text-dark">${escapeHtml(t.id)}</strong></td>
        <td>${escapeHtml(t.title)}</td>
        <td class="text-muted small">${escapeHtml(t.date)}</td>
        <td><span class="fw-bold ${t.score >= 75 ? 'text-success' : 'text-primary'}">${t.score}%</span></td>
        <td><span class="badge ${badgeClass}">${escapeHtml(t.status)}</span></td>
        <td>
          <a href="quiz.html" class="btn btn-sm btn-outline-primary rounded-pill py-0 px-2" style="font-size: 0.78rem;">
            Retake
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function renderBotInsights(profile) {
  const container = document.getElementById("botInsightsCard");
  if (!container) return;

  container.innerHTML = `
    <div class="d-flex align-items-start gap-3">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #229ED9; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem; flex-shrink: 0;">
        <i class="bi bi-robot"></i>
      </div>
      <div>
        <h6 class="fw-bold text-dark mb-1">PlaceBot AI Placement Advisor</h6>
        <p class="text-muted small mb-2">
          Based on your recent tests, your <strong>Quantitative Aptitude</strong> and <strong>Logical Reasoning</strong> are at an impressive 80% accuracy! 
          To ensure qualification in top MNC rounds (TCS Digital, Cognizant GenC Elevate), we recommend practicing <strong>SQL Joins</strong> and <strong>Verbal Sentence Corrections</strong>.
        </p>
        <div class="d-flex gap-2 flex-wrap">
          <a href="chat.html" class="btn btn-sm btn-primary rounded-pill px-3">
            <i class="bi bi-chat-dots-fill me-1"></i> Practice in Chat
          </a>
          <a href="quiz.html" class="btn btn-sm btn-outline-primary rounded-pill px-3">
            <i class="bi bi-play-circle-fill me-1"></i> Take Fresh Mock
          </a>
        </div>
      </div>
    </div>
  `;
}

function initProgressActions() {
  const resetBtn = document.getElementById("btnResetProgress");
  const seedBtn = document.getElementById("btnSeedSampleData");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all test progress and start fresh?")) {
        const freshData = {
          username: "Alex Rivera",
          streakDays: 1,
          level: 1,
          levelTitle: "Placement Beginner",
          totalSolved: 0,
          totalTests: 0,
          overallAccuracy: 0,
          categories: {
            aptitude: { solved: 0, correct: 0, totalAvailable: 150 },
            reasoning: { solved: 0, correct: 0, totalAvailable: 120 },
            verbal: { solved: 0, correct: 0, totalAvailable: 100 },
            technical: { solved: 0, correct: 0, totalAvailable: 180 }
          },
          testHistory: []
        };
        localStorage.setItem("placebot_profile", JSON.stringify(freshData));
        localStorage.removeItem("placebot_last_result");
        renderProgressDashboard();
      }
    });
  }

  if (seedBtn) {
    seedBtn.addEventListener("click", () => {
      localStorage.removeItem("placebot_profile");
      window.location.reload();
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
