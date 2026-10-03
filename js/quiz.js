/**
 * PlaceBot - Quiz & Mock Test Engine (quiz.js)
 * Implements Telegram Poll Mode, Timed Mock Assessment,
 * Instant Practice Feedback & Question Navigation Palette.
 */

const MOCK_QUESTION_BANK = [
  {
    id: 1,
    category: "Quantitative Aptitude",
    topic: "Percentages & Profit",
    question: "A merchant marks his goods 25% above the cost price and allows a discount of 12% on the marked price. What is his percentage profit?",
    code: null,
    options: ["8%", "10%", "12.5%", "15%"],
    correct: 1, // 10%
    explanation: "Let Cost Price (CP) = 100.\nMarked Price (MP) = 100 + 25 = 125.\nDiscount = 12% of 125 = (12/100) * 125 = 15.\nSelling Price (SP) = 125 - 15 = 110.\nProfit = SP - CP = 110 - 100 = 10%."
  },
  {
    id: 2,
    category: "Quantitative Aptitude",
    topic: "Time & Work",
    question: "Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened simultaneously when the tank is empty, how long will it take to fill the tank?",
    code: null,
    options: ["18 hours", "20 hours", "24 hours", "28 hours"],
    correct: 2, // 24 hours
    explanation: "Net filling rate per hour = (1/6 - 1/8) = (4 - 3)/24 = 1/24 tank per hour.\nTherefore, the tank will be completely filled in 24 hours."
  },
  {
    id: 3,
    category: "Logical Reasoning",
    topic: "Number Series",
    question: "Find the next missing number in the sequence: 7, 14, 28, 56, 112, ?",
    code: null,
    options: ["168", "196", "224", "240"],
    correct: 2, // 224
    explanation: "Each number in the series is multiplied by 2: 7 * 2 = 14; 14 * 2 = 28; 28 * 2 = 56; 56 * 2 = 112; 112 * 2 = 224."
  },
  {
    id: 4,
    category: "Logical Reasoning",
    topic: "Syllogism",
    question: "Statements:\n1. All developers are problem solvers.\n2. Some problem solvers are musicians.\nConclusions:\nI. Some developers are musicians.\nII. Some problem solvers are developers.",
    code: null,
    options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    correct: 1, // Only II follows
    explanation: "From 'All developers are problem solvers', the converse is 'Some problem solvers are developers' (Conclusion II is valid). There is no guaranteed overlap between developers and musicians, so I does not necessarily follow."
  },
  {
    id: 5,
    category: "Verbal Ability",
    topic: "Grammar & Error Spotting",
    question: "Identify the part of the sentence with a grammatical error:\n'Each of the students (A) / have submitted their project report (B) / before the deadline (C) / No Error (D)'",
    code: null,
    options: ["Part A", "Part B ('have' -> 'has')", "Part C", "Part D"],
    correct: 1, // Part B
    explanation: "'Each' is an indefinite pronoun that takes a singular verb. Therefore, 'have submitted' should be corrected to 'has submitted'."
  },
  {
    id: 6,
    category: "Verbal Ability",
    topic: "Vocabulary & Antonyms",
    question: "Choose the word which is most OPPOSITE in meaning to 'EPHEMERAL':",
    code: null,
    options: ["Transient", "Permanent & Enduring", "Brief", "Fragile"],
    correct: 1, // Permanent & Enduring
    explanation: "'Ephemeral' means lasting for a very short time. Its direct antonym is 'Permanent' or 'Enduring'."
  },
  {
    id: 7,
    category: "Technical (Data Structures)",
    topic: "Trees & Complexity",
    question: "What is the worst-case time complexity of inserting a node into an un-balanced Binary Search Tree (BST)?",
    code: "// Unbalanced BST insertion\nvoid insert(Node* root, int val);",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct: 2, // O(N)
    explanation: "In an un-balanced BST (e.g. skewed tree like a linked list with strictly increasing values 1, 2, 3, 4, 5), insertion requires traversing all N nodes, resulting in O(N) worst-case complexity."
  },
  {
    id: 8,
    category: "Technical (SQL & DBMS)",
    topic: "Database Queries",
    question: "Which SQL command is used to remove all records from a table without logging individual row deletions and cannot be rolled back in most engines?",
    code: "TABLE: candidates;\n// Action: remove all records fast",
    options: ["DELETE FROM candidates;", "DROP TABLE candidates;", "TRUNCATE TABLE candidates;", "REMOVE ALL FROM candidates;"],
    correct: 2, // TRUNCATE TABLE
    explanation: "TRUNCATE is a DDL command that deallocates data pages. It is much faster than DELETE because it does not log individual row deletions and resets table identity."
  },
  {
    id: 9,
    category: "Technical (Programming & Output)",
    topic: "C / C++ Pointers",
    question: "What is the expected output of this C code snippet?",
    code: "#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30, 40};\n    int *ptr = arr;\n    *(ptr + 2) += 5;\n    printf(\"%d\", arr[2]);\n    return 0;\n}",
    options: ["30", "35", "25", "Garbage value"],
    correct: 1, // 35
    explanation: "*(ptr + 2) points to arr[2] (which is 30). Adding 5 to it modifies arr[2] in place to 35."
  },
  {
    id: 10,
    category: "Technical (Object-Oriented Programming)",
    topic: "OOPs Principles",
    question: "Which OOP concept is demonstrated when a function in a derived class provides a specific implementation of a method already defined in its base class?",
    code: "class Animal { virtual void sound(); };\nclass Dog : public Animal { void sound() override; };",
    options: ["Method Overloading", "Method Overriding", "Encapsulation", "Abstraction"],
    correct: 1, // Method Overriding
    explanation: "Method overriding (runtime polymorphism) occurs when a derived class overrides a virtual function defined in the base class to provide custom behavior."
  }
];

// Quiz State
let quizQuestions = [...MOCK_QUESTION_BANK];
let currentQIndex = 0;
let userAnswers = {}; // { qIndex: selectedOptionIndex }
let flaggedQuestions = new Set();
let quizMode = "exam"; // 'exam' or 'practice'
let timeRemaining = 15 * 60; // 15 minutes in seconds
let timerInterval = null;
let startTime = Date.now();

document.addEventListener("DOMContentLoaded", () => {
  initQuizElements();
  loadQuestion(0);
  startTimer();
  renderNavigator();
});

function initQuizElements() {
  // Mode switcher
  const modeExamBtn = document.getElementById("modeExamBtn");
  const modePracticeBtn = document.getElementById("modePracticeBtn");

  if (modeExamBtn && modePracticeBtn) {
    modeExamBtn.addEventListener("click", () => {
      quizMode = "exam";
      modeExamBtn.classList.add("active");
      modePracticeBtn.classList.remove("active");
      document.getElementById("practiceExplanationBox").classList.remove("show");
      loadQuestion(currentQIndex);
    });

    modePracticeBtn.addEventListener("click", () => {
      quizMode = "practice";
      modePracticeBtn.classList.add("active");
      modeExamBtn.classList.remove("active");
      loadQuestion(currentQIndex);
    });
  }

  // Flag Button
  const flagBtn = document.getElementById("btnFlagQuestion");
  if (flagBtn) {
    flagBtn.addEventListener("click", () => {
      if (flaggedQuestions.has(currentQIndex)) {
        flaggedQuestions.delete(currentQIndex);
        flagBtn.classList.remove("flagged");
      } else {
        flaggedQuestions.add(currentQIndex);
        flagBtn.classList.add("flagged");
      }
      renderNavigator();
    });
  }

  // Navigation Buttons
  const prevBtn = document.getElementById("btnPrevQuestion");
  const nextBtn = document.getElementById("btnNextQuestion");
  const submitBtn = document.getElementById("btnSubmitAssessment");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentQIndex > 0) {
        loadQuestion(currentQIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentQIndex < quizQuestions.length - 1) {
        loadQuestion(currentQIndex + 1);
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      confirmAndSubmitQuiz();
    });
  }
}

// Timer Functions
function startTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  const timerPill = document.getElementById("timerPill");

  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timeRemaining = 0;
      updateTimerUI(timerDisplay, timerPill);
      alert("⏱️ Time is up! Your placement mock test is being submitted automatically.");
      finalizeAndSaveResults();
      return;
    }

    updateTimerUI(timerDisplay, timerPill);
  }, 1000);
}

function updateTimerUI(display, pill) {
  if (!display || !pill) return;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (timeRemaining <= 120 && timeRemaining > 30) {
    pill.classList.add("timer-warning");
  } else if (timeRemaining <= 30) {
    pill.classList.remove("timer-warning");
    pill.classList.add("timer-danger");
  }
}

// Load Question at Index
function loadQuestion(index) {
  currentQIndex = index;
  const q = quizQuestions[index];
  if (!q) return;

  // Header & Tags
  const qCategoryBadge = document.getElementById("quizCategoryBadge");
  const qNumberPill = document.getElementById("quizQuestionNumPill");
  const qText = document.getElementById("quizQuestionText");
  const qCodeWrap = document.getElementById("quizCodeSnippetWrap");
  const optionsList = document.getElementById("quizOptionsList");
  const explanationBox = document.getElementById("practiceExplanationBox");
  const flagBtn = document.getElementById("btnFlagQuestion");

  if (qCategoryBadge) qCategoryBadge.innerHTML = `<i class="bi bi-tag-fill"></i> ${q.category} • ${q.topic}`;
  if (qNumberPill) qNumberPill.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
  if (qText) qText.textContent = q.question;

  // Code Block
  if (qCodeWrap) {
    if (q.code) {
      qCodeWrap.innerHTML = `<pre class="poll-code-block"><code>${escapeHtml(q.code)}</code></pre>`;
      qCodeWrap.style.display = "block";
    } else {
      qCodeWrap.innerHTML = "";
      qCodeWrap.style.display = "none";
    }
  }

  // Update Flag state
  if (flagBtn) {
    flagBtn.classList.toggle("flagged", flaggedQuestions.has(index));
  }

  // Build Options
  optionsList.innerHTML = "";
  const userSelection = userAnswers[index];

  q.options.forEach((optText, optIdx) => {
    const isSelected = (userSelection === optIdx);
    const item = document.createElement("div");
    item.className = `poll-option-item ${isSelected ? 'selected' : ''}`;

    // Practice mode instant reveal if user has answered
    if (quizMode === "practice" && userSelection !== undefined) {
      if (optIdx === q.correct) {
        item.classList.add("revealed-correct");
      } else if (isSelected && optIdx !== q.correct) {
        item.classList.add("revealed-wrong");
      }
    }

    item.innerHTML = `
      <div class="poll-radio-circle"></div>
      <div class="poll-option-text">
        <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${escapeHtml(optText)}
      </div>
      <i class="bi bi-check-circle-fill poll-status-icon ms-auto"></i>
      <i class="bi bi-x-circle-fill poll-status-icon ms-auto"></i>
    `;

    item.addEventListener("click", () => {
      selectOption(index, optIdx);
    });

    optionsList.appendChild(item);
  });

  // Explanation in Practice Mode
  if (explanationBox) {
    if (quizMode === "practice" && userSelection !== undefined) {
      const isCorrect = (userSelection === q.correct);
      explanationBox.innerHTML = `
        <div class="explanation-title" style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}">
          <i class="bi bi-${isCorrect ? 'check-circle' : 'exclamation-circle'}-fill"></i> 
          ${isCorrect ? 'Well done! Correct Answer.' : 'Incorrect! Correct answer is (' + String.fromCharCode(65 + q.correct) + ')'}
        </div>
        <div>${escapeHtml(q.explanation).replace(/\n/g, '<br>')}</div>
      `;
      explanationBox.classList.add("show");
    } else {
      explanationBox.classList.remove("show");
    }
  }

  // Prev / Next button states
  const prevBtn = document.getElementById("btnPrevQuestion");
  const nextBtn = document.getElementById("btnNextQuestion");
  if (prevBtn) prevBtn.disabled = (index === 0);
  if (nextBtn) {
    if (index === quizQuestions.length - 1) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-flex";
    }
  }

  renderNavigator();
}

function selectOption(qIndex, optIdx) {
  userAnswers[qIndex] = optIdx;
  PlaceBotAudio.playTelegramPop();
  loadQuestion(qIndex);
}

// Render Navigator Grid
function renderNavigator() {
  const navGrid = document.getElementById("quizNavGrid");
  if (!navGrid) return;
  navGrid.innerHTML = "";

  quizQuestions.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.className = "nav-q-btn";
    btn.textContent = (idx + 1);

    if (idx === currentQIndex) {
      btn.classList.add("current");
    } else if (flaggedQuestions.has(idx)) {
      btn.classList.add("flagged");
    } else if (userAnswers[idx] !== undefined) {
      btn.classList.add("answered");
    }

    btn.addEventListener("click", () => {
      loadQuestion(idx);
    });

    navGrid.appendChild(btn);
  });

  // Update summary counts
  const answeredCount = Object.keys(userAnswers).length;
  const remainingCount = quizQuestions.length - answeredCount;
  const countEl = document.getElementById("answeredStatsText");
  if (countEl) {
    countEl.textContent = `${answeredCount} Answered • ${remainingCount} Remaining`;
  }
}

// Submit Assessment
function confirmAndSubmitQuiz() {
  const answeredCount = Object.keys(userAnswers).length;
  const unAnsweredCount = quizQuestions.length - answeredCount;

  let msg = `Are you ready to submit your Placement Mock Test?\n\nAnswered: ${answeredCount}\nUnanswered: ${unAnsweredCount}`;
  if (unAnsweredCount > 0) {
    msg += "\n\nTip: You still have time to review unanswered questions!";
  }

  if (confirm(msg)) {
    clearInterval(timerInterval);
    finalizeAndSaveResults();
  }
}

function finalizeAndSaveResults() {
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const categoryBreakdown = {};

  quizQuestions.forEach((q, idx) => {
    const chosen = userAnswers[idx];
    const cat = q.category;
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
    }
    categoryBreakdown[cat].total++;

    if (chosen === undefined) {
      skippedCount++;
      categoryBreakdown[cat].skipped++;
    } else if (chosen === q.correct) {
      correctCount++;
      categoryBreakdown[cat].correct++;
    } else {
      wrongCount++;
      categoryBreakdown[cat].wrong++;
    }
  });

  const totalQuestions = quizQuestions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const timeTakenSec = (15 * 60) - timeRemaining;
  const timeTakenFormatted = `${Math.floor(timeTakenSec / 60)}m ${timeTakenSec % 60}s`;

  // Detailed review packet
  const reviewPacket = quizQuestions.map((q, idx) => ({
    id: q.id,
    category: q.category,
    topic: q.topic,
    question: q.question,
    code: q.code,
    options: q.options,
    correctIndex: q.correct,
    userSelected: userAnswers[idx] !== undefined ? userAnswers[idx] : null,
    isCorrect: userAnswers[idx] === q.correct,
    explanation: q.explanation
  }));

  const testResult = {
    testId: `MOCK-${Date.now().toString().slice(-4)}`,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    totalQuestions,
    correctCount,
    wrongCount,
    skippedCount,
    scorePercent,
    timeTaken: timeTakenFormatted,
    categoryBreakdown,
    questionsReview: reviewPacket
  };

  // Save to localStorage
  localStorage.setItem("placebot_last_result", JSON.stringify(testResult));

  // Also update overall profile
  try {
    const profile = JSON.parse(localStorage.getItem("placebot_profile") || "{}");
    profile.totalTests = (profile.totalTests || 0) + 1;
    profile.totalSolved = (profile.totalSolved || 0) + totalQuestions;

    // Update categories
    for (const [catName, cData] of Object.entries(categoryBreakdown)) {
      const key = catName.toLowerCase().includes("quant") ? "aptitude"
                : catName.toLowerCase().includes("reason") ? "reasoning"
                : catName.toLowerCase().includes("verbal") ? "verbal"
                : "technical";
      if (profile.categories && profile.categories[key]) {
        profile.categories[key].solved += cData.total;
        profile.categories[key].correct += cData.correct;
      }
    }

    // Add to history
    profile.testHistory = profile.testHistory || [];
    profile.testHistory.unshift({
      id: testResult.testId,
      title: "Placement Assessment Mock",
      date: "Just now",
      score: scorePercent,
      total: totalQuestions,
      accuracy: `${scorePercent}%`,
      status: scorePercent >= 75 ? "Distinction" : scorePercent >= 60 ? "Passed" : "Needs Practice"
    });

    localStorage.setItem("placebot_profile", JSON.stringify(profile));
  } catch (e) {}

  // Redirect to result.html
  window.location.href = "result.html";
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
