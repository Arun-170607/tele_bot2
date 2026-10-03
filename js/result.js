/**
 * PlaceBot - Assessment Result & Analysis (result.js)
 * Parses test performance, animates score gauges, calculates company eligibility,
 * and renders detailed question reviews with solutions.
 */

document.addEventListener("DOMContentLoaded", () => {
  const resultData = loadTestResult();
  renderResultSummary(resultData);
  renderCompanyReadiness(resultData.scorePercent);
  renderCategoryBreakdown(resultData.categoryBreakdown);
  renderQuestionReview(resultData.questionsReview);
  setupReviewFilterTabs(resultData.questionsReview);
});

// Load result data from localStorage or create realistic demo
function loadTestResult() {
  const stored = localStorage.getItem("placebot_last_result");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }

  // High quality default fallback if user visits result.html directly
  return {
    testId: "MOCK-DEMO",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    totalQuestions: 10,
    correctCount: 8,
    wrongCount: 1,
    skippedCount: 1,
    scorePercent: 80,
    timeTaken: "9m 42s",
    categoryBreakdown: {
      "Quantitative Aptitude": { total: 2, correct: 2, wrong: 0, skipped: 0 },
      "Logical Reasoning": { total: 2, correct: 2, wrong: 0, skipped: 0 },
      "Verbal Ability": { total: 2, correct: 1, wrong: 1, skipped: 0 },
      "Technical": { total: 4, correct: 3, wrong: 0, skipped: 1 }
    },
    questionsReview: [
      {
        id: 1,
        category: "Quantitative Aptitude",
        topic: "Percentages & Profit",
        question: "A merchant marks his goods 25% above cost price and allows a discount of 12% on marked price. What is his percentage profit?",
        code: null,
        options: ["8%", "10%", "12.5%", "15%"],
        correctIndex: 1,
        userSelected: 1,
        isCorrect: true,
        explanation: "Cost Price = 100. Marked Price = 125. Discount = 12% of 125 = 15. Selling Price = 110. Profit = 10%."
      },
      {
        id: 2,
        category: "Technical",
        topic: "SQL Commands",
        question: "Which SQL command is used to remove all records from a table without logging individual row deletions?",
        code: "TABLE: candidates;\n// Action: remove all records fast",
        options: ["DELETE FROM candidates;", "DROP TABLE candidates;", "TRUNCATE TABLE candidates;", "REMOVE ALL;"],
        correctIndex: 2,
        userSelected: 2,
        isCorrect: true,
        explanation: "TRUNCATE is a DDL command that deallocates data pages without logging individual row deletions."
      }
    ]
  };
}

// Render Summary KPIs and Animated Score Ring
function renderResultSummary(data) {
  const scorePercentEl = document.getElementById("scorePercentDisplay");
  const scoreGradeEl = document.getElementById("scoreGradeDisplay");
  const testIdEl = document.getElementById("resultTestId");
  const dateEl = document.getElementById("resultDate");
  const correctEl = document.getElementById("metricCorrectCount");
  const wrongEl = document.getElementById("metricWrongCount");
  const skippedEl = document.getElementById("metricSkippedCount");
  const timeEl = document.getElementById("metricTimeTaken");
  const accuracyEl = document.getElementById("metricAccuracyRate");
  const circleProgress = document.getElementById("scoreCircleIndicator");

  if (testIdEl) testIdEl.textContent = data.testId;
  if (dateEl) dateEl.textContent = data.date;
  if (correctEl) correctEl.textContent = data.correctCount;
  if (wrongEl) wrongEl.textContent = data.wrongCount;
  if (skippedEl) skippedEl.textContent = data.skippedCount;
  if (timeEl) timeEl.textContent = data.timeTaken || "10m";

  const totalAttempted = data.correctCount + data.wrongCount;
  const accuracy = totalAttempted > 0 ? Math.round((data.correctCount / totalAttempted) * 100) : 0;
  if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;

  // Animate Percentage Number
  if (scorePercentEl) {
    let current = 0;
    const target = data.scorePercent;
    const stepTime = 15;
    const increment = target > 50 ? 2 : 1;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      scorePercentEl.textContent = `${current}%`;
    }, stepTime);
  }

  // Grade Assessment Badge
  if (scoreGradeEl) {
    if (data.scorePercent >= 80) {
      scoreGradeEl.className = "badge bg-success";
      scoreGradeEl.innerHTML = `<i class="bi bi-patch-check-fill"></i> Placement Ready (Excellent)`;
    } else if (data.scorePercent >= 60) {
      scoreGradeEl.className = "badge bg-primary";
      scoreGradeEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> Qualified (Good)`;
    } else {
      scoreGradeEl.className = "badge bg-warning text-dark";
      scoreGradeEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Needs More Practice`;
    }
  }

  // Update circular dash offset if SVG ring present
  if (circleProgress) {
    const circumference = 2 * Math.PI * 54; // r = 54
    const offset = circumference - (data.scorePercent / 100) * circumference;
    circleProgress.style.strokeDashoffset = offset;
  }
}

// Company Placement Readiness Matrix
function renderCompanyReadiness(score) {
  const companyCardsWrap = document.getElementById("companyEligibilityWrap");
  if (!companyCardsWrap) return;

  const companies = [
    { name: "TCS NQT", cutoff: 70, role: "Ninja & Digital Developer", icon: "bi-laptop" },
    { name: "Infosys INFYTQ", cutoff: 65, role: "Systems Engineer (SE / DSE)", icon: "bi-code-slash" },
    { name: "Wipro Elite NTH", cutoff: 60, role: "Project Engineer", icon: "bi-building-check" },
    { name: "Cognizant GenC", cutoff: 70, role: "Programmer Analyst Trainee", icon: "bi-hdd-network" },
    { name: "Accenture ASE", cutoff: 75, role: "Associate Software Engineer", icon: "bi-cpu" }
  ];

  companyCardsWrap.innerHTML = companies.map(comp => {
    const isEligible = score >= comp.cutoff;
    return `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card h-100 border p-3 ${isEligible ? 'border-success-subtle bg-white' : 'bg-light'}">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="fw-bold mb-0 text-dark"><i class="bi ${comp.icon} text-primary me-1"></i> ${comp.name}</h6>
            <span class="badge ${isEligible ? 'bg-success' : 'bg-secondary'}">
              ${isEligible ? 'Eligible ✓' : 'Cutoff: ' + comp.cutoff + '%'}
            </span>
          </div>
          <div class="text-muted small mb-2">${comp.role}</div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar ${isEligible ? 'bg-success' : 'bg-warning'}" style="width: ${Math.min(100, Math.round((score / comp.cutoff) * 100))}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Category Performance Bars
function renderCategoryBreakdown(catBreakdown) {
  const container = document.getElementById("categoryBreakdownContainer");
  if (!container || !catBreakdown) return;

  let html = "";
  for (const [catName, data] of Object.entries(catBreakdown)) {
    const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    const colorClass = accuracy >= 75 ? "bg-success" : accuracy >= 50 ? "bg-primary" : "bg-danger";

    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-semibold text-dark small">${catName}</span>
          <span class="small text-muted">${data.correct}/${data.total} Correct (${accuracy}%)</span>
        </div>
        <div class="progress" style="height: 8px; border-radius: 4px;">
          <div class="progress-bar ${colorClass}" role="progressbar" style="width: ${accuracy}%"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// Question-by-Question Detailed Review
function renderQuestionReview(questions, filter = "all") {
  const container = document.getElementById("reviewQuestionsList");
  if (!container || !questions) return;

  const filtered = questions.filter(q => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-inbox fs-2"></i>
        <p class="mt-2">No questions found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((q, idx) => {
    const isAnswered = q.userSelected !== null && q.userSelected !== undefined;
    const statusBadge = q.isCorrect 
      ? `<span class="badge bg-success-subtle text-success"><i class="bi bi-check-circle"></i> Correct</span>`
      : !isAnswered
      ? `<span class="badge bg-secondary-subtle text-secondary"><i class="bi bi-dash-circle"></i> Skipped</span>`
      : `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-x-circle"></i> Incorrect</span>`;

    const userSelectedText = isAnswered 
      ? `${String.fromCharCode(65 + q.userSelected)}. ${escapeHtml(q.options[q.userSelected])}`
      : "Not Attempted";

    const correctText = `${String.fromCharCode(65 + q.correctIndex)}. ${escapeHtml(q.options[q.correctIndex])}`;

    return `
      <div class="card mb-3 border shadow-sm rounded-3">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge bg-light text-primary border fw-semibold">${q.category}</span>
            ${statusBadge}
          </div>
          <h6 class="fw-bold text-dark mb-2">${idx + 1}. ${escapeHtml(q.question)}</h6>
          
          ${q.code ? `<pre class="bg-dark text-info p-2 rounded small mb-2"><code>${escapeHtml(q.code)}</code></pre>` : ''}

          <div class="row g-2 mb-2 small">
            <div class="col-sm-6">
              <div class="p-2 rounded ${q.isCorrect ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}">
                <strong>Your Answer:</strong> ${userSelectedText}
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-2 rounded bg-light border text-dark">
                <strong>Correct Answer:</strong> ${correctText}
              </div>
            </div>
          </div>

          <div class="p-2 rounded bg-light border-start border-4 border-primary small text-muted">
            <strong class="text-dark d-block mb-1"><i class="bi bi-lightbulb text-warning"></i> Explanation & Solution:</strong>
            ${escapeHtml(q.explanation).replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Filter Tabs for Review
function setupReviewFilterTabs(questions) {
  const tabs = document.querySelectorAll(".review-filter-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active", "btn-primary"));
      tabs.forEach(t => t.classList.add("btn-outline-secondary"));
      tab.classList.remove("btn-outline-secondary");
      tab.classList.add("active", "btn-primary");

      const filterType = tab.getAttribute("data-filter") || "all";
      renderQuestionReview(questions, filterType);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
