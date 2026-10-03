/**
 * PlaceBot - Telegram Chat Interface Engine (chat.js)
 * Simulates Telegram Web with interactive Bot conversations, inline keyboards,
 * dynamic question solving, typing indicator, and sound effects.
 */

// Placement Chat Question Bank for Instant Bot Practice
const CHAT_QUESTIONS = {
  aptitude: [
    {
      id: "apt_1",
      topic: "Quantitative Aptitude (Profit & Loss)",
      question: "A shopkeeper marks an article at 40% above cost price and allows a discount of 20%. What is his net profit percentage?",
      options: ["10%", "12%", "15%", "18%"],
      correct: 1, // 12%
      explanation: "Let Cost Price = 100. Marked Price = 140. Discount = 20% of 140 = 28. Selling Price = 140 - 28 = 112. Profit = 112 - 100 = 12%."
    },
    {
      id: "apt_2",
      topic: "Quantitative Aptitude (Time & Work)",
      question: "A can complete a project in 12 days and B in 18 days. If they work together for 4 days, what fraction of work is left?",
      options: ["1/3", "4/9", "5/9", "2/3"],
      correct: 1, // 4/9
      explanation: "1 day work of (A + B) = (1/12 + 1/18) = 5/36. In 4 days work done = 4 * (5/36) = 20/36 = 5/9. Work left = 1 - 5/9 = 4/9."
    },
    {
      id: "apt_3",
      topic: "Quantitative Aptitude (Speed & Distance)",
      question: "A 240 m long train crosses a platform of equal length in 24 seconds. What is the speed of the train in km/h?",
      options: ["60 km/h", "72 km/h", "80 km/h", "90 km/h"],
      correct: 1, // 72 km/h
      explanation: "Total Distance = 240 + 240 = 480 m. Speed = Distance / Time = 480 / 24 = 20 m/s. Convert to km/h: 20 * (18/5) = 72 km/h."
    }
  ],
  reasoning: [
    {
      id: "reas_1",
      topic: "Logical Reasoning (Coding-Decoding)",
      question: "In a certain code, 'CAMPUS' is written as 'EDORWU'. How will 'OFFER' be written in that code?",
      options: ["QHHGT", "PGGHT", "QHGIS", "PHGHT"],
      correct: 0, // QHHGT
      explanation: "Each letter is shifted forward by +2 positions in alphabetical order: C+2=E, A+2=D, M+2=O... So O+2=Q, F+2=H, F+2=H, E+2=G, R+2=T -> QHHGT."
    },
    {
      id: "reas_2",
      topic: "Logical Reasoning (Blood Relations)",
      question: "Pointing to a photograph, Rohit says, 'She is the daughter of the only son of my grandfather.' How is the girl related to Rohit?",
      options: ["Daughter", "Sister", "Mother", "Aunt"],
      correct: 1, // Sister
      explanation: "'Only son of my grandfather' = Rohit's father. Daughter of Rohit's father = Rohit's sister."
    }
  ],
  verbal: [
    {
      id: "verb_1",
      topic: "Verbal Ability (Error Spotting)",
      question: "Choose the part of the sentence containing an error:\n'Neither the manager (A) / nor the team members (B) / was present at the placement briefing (C) / No error (D)'",
      options: ["Part A", "Part B", "Part C ('was' -> 'were')", "Part D"],
      correct: 2, // Part C
      explanation: "Rule of proximity for 'Neither... nor': the verb agrees with the closer subject ('team members' is plural), so 'was' must be 'were'."
    },
    {
      id: "verb_2",
      topic: "Verbal Ability (Vocabulary)",
      question: "Select the most appropriate synonym for the word 'METICULOUS':",
      options: ["Careless", "Thorough & Diligent", "Hasty", "Arrogant"],
      correct: 1, // Thorough & Diligent
      explanation: "'Meticulous' means showing great attention to detail; very careful and precise."
    }
  ],
  technical: [
    {
      id: "tech_1",
      topic: "Technical (Data Structures & C++)",
      question: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL tree)?",
      code: "// Search query in AVL\nNode* search(Node* root, int key);",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correct: 1, // O(log N)
      explanation: "Because an AVL tree is height-balanced, the tree height is always strictly maintained at O(log N), guaranteeing O(log N) search."
    },
    {
      id: "tech_2",
      topic: "Technical (DBMS & SQL)",
      question: "Which SQL clause is used to filter records resulting from a GROUP BY aggregation?",
      code: "SELECT dept, COUNT(*) \nFROM employees \nGROUP BY dept \n________ COUNT(*) > 5;",
      options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
      correct: 1, // HAVING
      explanation: "HAVING is evaluated after GROUP BY to filter grouped records. WHERE filters individual rows before aggregation occurs."
    },
    {
      id: "tech_3",
      topic: "Technical (Python)",
      question: "What is the output of the following Python snippet?",
      code: "nums = [1, 2, 3]\nnums.append([4, 5])\nprint(len(nums))",
      options: ["3", "4", "5", "Error"],
      correct: 1, // 4
      explanation: "The .append() method inserts the entire list [4, 5] as a single nested element at index 3. So len is 4. (To flatten, .extend() would make it 5)."
    }
  ]
};

// State Tracker
let activeCategory = "aptitude";
let currentQuestionIndex = 0;
let isBotTyping = false;
let audioEnabled = true;

document.addEventListener("DOMContentLoaded", () => {
  const messagesViewport = document.getElementById("chatMessagesViewport");
  const chatInput = document.getElementById("chatInputField");
  const sendBtn = document.getElementById("chatSendBtn");
  const commandsPopup = document.getElementById("commandsPopup");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
  const tgSidebar = document.getElementById("tgSidebar");

  // Toggle Audio
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      PlaceBotAudio.enabled = audioEnabled;
      audioToggleBtn.classList.toggle("active-audio", audioEnabled);
      const icon = audioToggleBtn.querySelector("i");
      if (icon) {
        icon.className = audioEnabled ? "bi bi-volume-up" : "bi bi-volume-mute";
      }
    });
  }

  // Mobile Sidebar Toggle
  if (toggleSidebarBtn && tgSidebar) {
    toggleSidebarBtn.addEventListener("click", () => {
      tgSidebar.classList.toggle("open-sidebar");
    });

    // Close when clicking inside chat area on mobile
    messagesViewport.addEventListener("click", () => {
      if (window.innerWidth <= 991 && tgSidebar.classList.contains("open-sidebar")) {
        tgSidebar.classList.remove("open-sidebar");
      }
    });
  }

  // Quick Command Chips in Sidebar
  document.querySelectorAll(".cmd-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const cmd = chip.getAttribute("data-cmd");
      if (cmd) {
        handleUserMessage(cmd);
        if (window.innerWidth <= 991 && tgSidebar) {
          tgSidebar.classList.remove("open-sidebar");
        }
      }
    });
  });

  // Sidebar Chat Item Switching
  document.querySelectorAll(".tg-chat-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".tg-chat-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const channel = item.getAttribute("data-channel");
      if (channel) {
        if (channel === "all") {
          sendBotMessage("👋 Back in main **PlaceBot** assistant! Type `/start` to see all commands.");
        } else if (CHAT_QUESTIONS[channel]) {
          activeCategory = channel;
          currentQuestionIndex = 0;
          sendCategoryIntro(channel);
        }
      }

      if (window.innerWidth <= 991 && tgSidebar) {
        tgSidebar.classList.remove("open-sidebar");
      }
    });
  });

  // Input Field Listeners
  if (chatInput && sendBtn) {
    // Show command suggestion popup if user inputs '/'
    chatInput.addEventListener("input", (e) => {
      const val = chatInput.value.trim();
      if (val === "/" || val.startsWith("/")) {
        commandsPopup.classList.add("show");
      } else {
        commandsPopup.classList.remove("show");
      }
    });

    // Click item in command popup
    document.querySelectorAll(".popup-cmd-item").forEach(item => {
      item.addEventListener("click", () => {
        const cmd = item.getAttribute("data-cmd");
        if (cmd) {
          commandsPopup.classList.remove("show");
          chatInput.value = "";
          handleUserMessage(cmd);
        }
      });
    });

    // Send on Enter
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitInput();
      }
    });

    // Send button click
    sendBtn.addEventListener("click", () => {
      submitInput();
    });
  }

  function submitInput() {
    const text = chatInput.value.trim();
    if (!text) return;
    commandsPopup.classList.remove("show");
    chatInput.value = "";
    handleUserMessage(text);
  }

  // Handle User Input / Commands
  function handleUserMessage(text) {
    appendUserBubble(text);
    PlaceBotAudio.playTelegramPop();

    const clean = text.trim().toLowerCase();

    // Command Parser
    if (clean === "/start") {
      simulateTyping(() => {
        sendStartMenu();
      });
    } else if (clean === "/aptitude" || clean === "aptitude") {
      activeCategory = "aptitude";
      currentQuestionIndex = 0;
      simulateTyping(() => {
        sendCategoryQuestion("aptitude", 0);
      });
    } else if (clean === "/reasoning" || clean === "reasoning") {
      activeCategory = "reasoning";
      currentQuestionIndex = 0;
      simulateTyping(() => {
        sendCategoryQuestion("reasoning", 0);
      });
    } else if (clean === "/verbal" || clean === "verbal") {
      activeCategory = "verbal";
      currentQuestionIndex = 0;
      simulateTyping(() => {
        sendCategoryQuestion("verbal", 0);
      });
    } else if (clean === "/technical" || clean === "technical" || clean === "coding") {
      activeCategory = "technical";
      currentQuestionIndex = 0;
      simulateTyping(() => {
        sendCategoryQuestion("technical", 0);
      });
    } else if (clean === "/mock" || clean === "mock test") {
      simulateTyping(() => {
        sendMockInvitation();
      });
    } else if (clean === "/progress" || clean === "my progress") {
      simulateTyping(() => {
        sendProgressCard();
      });
    } else if (clean === "/help") {
      simulateTyping(() => {
        sendHelpMessage();
      });
    } else if (clean === "/clear") {
      clearChatMessages();
    } else if (clean.includes("hi") || clean.includes("hello") || clean.includes("hey")) {
      simulateTyping(() => {
        sendBotMessage("👋 Hello future Software Engineer! I'm **PlaceBot**.\n\nReady to crack your campus placement? Select a topic or type `/start` to begin practicing!");
      });
    } else {
      simulateTyping(() => {
        sendBotMessage(`I heard: "${escapeHtml(text)}".\n\nTo practice placement questions, choose an option below or type a command like \`/aptitude\`, \`/technical\`, or \`/mock\`.`, [
          { text: "🔢 Practice Aptitude", cmd: "/aptitude" },
          { text: "💻 Practice Technical", cmd: "/technical" },
          { text: "📝 Launch Mock Test", cmd: "/mock" },
          { text: "📊 Check Progress", cmd: "/progress" }
        ]);
      });
    }
  }

  // Append user bubble to chat viewport
  function appendUserBubble(text) {
    const time = getFormattedCurrentTime();
    const row = document.createElement("div");
    row.className = "msg-row outgoing";
    row.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-text-content">
          <p>${escapeHtml(text)}</p>
        </div>
        <div class="bubble-footer">
          <span>${time}</span>
          <i class="bi bi-check2-all read-check"></i>
        </div>
      </div>
    `;
    messagesViewport.appendChild(row);
    scrollToBottom();
  }

  // Append bot bubble
  function appendBotBubble(htmlContent, inlineButtons = []) {
    const time = getFormattedCurrentTime();
    const row = document.createElement("div");
    row.className = "msg-row incoming";

    let buttonsHtml = "";
    if (inlineButtons && inlineButtons.length > 0) {
      buttonsHtml = `
        <div class="tg-inline-keyboard">
          <div class="tg-keyboard-grid">
            ${inlineButtons.map(btn => `
              <button class="tg-btn-action" onclick="window.PlaceBotApp.triggerCommand('${btn.cmd}')">
                ${btn.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-text-content">
          ${htmlContent}
        </div>
        ${buttonsHtml}
        <div class="bubble-footer">
          <span>${time}</span>
        </div>
      </div>
    `;
    messagesViewport.appendChild(row);
    scrollToBottom();
    PlaceBotAudio.playTelegramPop();
  }

  // Simulate typing indicator
  function simulateTyping(callback) {
    if (isBotTyping) return;
    isBotTyping = true;

    const typingRow = document.createElement("div");
    typingRow.className = "tg-typing-row";
    typingRow.id = "activeTypingRow";
    typingRow.innerHTML = `
      <span>PlaceBot is typing</span>
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesViewport.appendChild(typingRow);
    scrollToBottom();

    setTimeout(() => {
      typingRow.remove();
      isBotTyping = false;
      callback();
    }, 700);
  }

  // Send category introductory message
  function sendCategoryIntro(catKey) {
    simulateTyping(() => {
      const titles = {
        aptitude: "Quantitative Aptitude Sprint",
        reasoning: "Logical Reasoning Mastery",
        verbal: "Verbal & Communication Skills",
        technical: "Technical & Coding Diagnostic"
      };
      const title = titles[catKey] || catKey.toUpperCase();
      sendBotMessage(`🎯 Switched to **${title}**.\nLet's tackle official placement-level questions!`);
      setTimeout(() => {
        simulateTyping(() => {
          sendCategoryQuestion(catKey, 0);
        });
      }, 400);
    });
  }

  // Render a question as a Telegram Bot message with inline option buttons
  function sendCategoryQuestion(catKey, index) {
    const list = CHAT_QUESTIONS[catKey];
    if (!list || !list[index]) {
      sendBotMessage(`🎉 Great job! You completed all questions in **${catKey}** for this session.`, [
        { text: "📊 View Progress", cmd: "/progress" },
        { text: "📝 Full Mock Test", cmd: "/mock" }
      ]);
      return;
    }

    const q = list[index];
    const time = getFormattedCurrentTime();
    const row = document.createElement("div");
    row.className = "msg-row incoming";

    let codeBlock = "";
    if (q.code) {
      codeBlock = `<pre class="code-block">${escapeHtml(q.code)}</pre>`;
    }

    row.innerHTML = `
      <div class="msg-bubble" id="msg_${q.id}">
        <div class="msg-text-content">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--primary); text-transform:uppercase;">${q.topic}</span>
            <span style="font-size:0.75rem; background:#f1f5f9; padding:2px 8px; border-radius:12px; color:var(--muted);">Q ${index + 1}/${list.length}</span>
          </div>
          <p style="font-weight:600; margin-bottom:8px;">${escapeHtml(q.question)}</p>
          ${codeBlock}
        </div>

        <!-- Inline Keyboard Poll Options -->
        <div class="tg-inline-keyboard" id="options_${q.id}">
          <div class="tg-keyboard-grid">
            ${q.options.map((opt, optIndex) => `
              <button class="tg-btn-option" data-opt="${optIndex}" onclick="window.PlaceBotApp.checkChatAnswer('${catKey}', ${index}, ${optIndex}, '${q.id}')">
                <span style="font-weight:700; color:var(--primary);">${String.fromCharCode(65 + optIndex)}.</span> ${escapeHtml(opt)}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="explanation_wrap_${q.id}"></div>

        <div class="bubble-footer">
          <span>${time}</span>
        </div>
      </div>
    `;

    messagesViewport.appendChild(row);
    scrollToBottom();
    PlaceBotAudio.playTelegramPop();
  }

  // Check answer when user taps an inline option button
  window.PlaceBotApp = window.PlaceBotApp || {};
  window.PlaceBotApp.checkChatAnswer = function(catKey, qIndex, selectedIndex, qElementId) {
    const q = CHAT_QUESTIONS[catKey][qIndex];
    if (!q) return;

    const optContainer = document.getElementById(`options_${qElementId}`);
    const explanationWrap = document.getElementById(`explanation_wrap_${qElementId}`);
    if (!optContainer) return;

    const buttons = optContainer.querySelectorAll(".tg-btn-option");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.style.cursor = "default";
      if (idx === q.correct) {
        btn.classList.add("selected-correct");
        btn.innerHTML += ` <i class="bi bi-check-circle-fill ms-auto"></i>`;
      } else if (idx === selectedIndex) {
        btn.classList.add("selected-wrong");
        btn.innerHTML += ` <i class="bi bi-x-circle-fill ms-auto"></i>`;
      }
    });

    const isCorrect = (selectedIndex === q.correct);
    if (isCorrect) {
      PlaceBotAudio.playSuccessDing();
      updateUserMetrics(catKey, true);
    } else {
      PlaceBotAudio.playWrongBuzz();
      updateUserMetrics(catKey, false);
    }

    if (explanationWrap) {
      const statusHeading = isCorrect 
        ? `<strong style="color:var(--success)"><i class="bi bi-check-circle-fill"></i> Correct Answer!</strong>`
        : `<strong style="color:var(--danger)"><i class="bi bi-x-circle-fill"></i> Incorrect! Correct was (${String.fromCharCode(65 + q.correct)})</strong>`;

      explanationWrap.innerHTML = `
        <div class="tg-explanation-box ${isCorrect ? 'success-border' : 'danger-border'}">
          <div style="margin-bottom:4px;">${statusHeading}</div>
          <div style="color:#334155; font-size:0.86rem; line-height:1.5;">${escapeHtml(q.explanation)}</div>
        </div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="tg-btn-action" style="flex:1;" onclick="window.PlaceBotApp.nextChatQuestion('${catKey}', ${qIndex + 1})">
            Next Question <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      `;
      scrollToBottom();
    }
  };

  window.PlaceBotApp.nextChatQuestion = function(catKey, nextIndex) {
    simulateTyping(() => {
      sendCategoryQuestion(catKey, nextIndex);
    });
  };

  window.PlaceBotApp.triggerCommand = function(cmd) {
    handleUserMessage(cmd);
  };

  // Bot Messages
  function sendStartMenu() {
    const html = `
      <p>🤖 <strong>Welcome to PlaceBot!</strong></p>
      <p>Your interactive Telegram placement preparation mentor. Choose a module below to start practice questions, or launch a timed mock exam.</p>
    `;
    const buttons = [
      { text: "🔢 Aptitude", cmd: "/aptitude" },
      { text: "🧠 Reasoning", cmd: "/reasoning" },
      { text: "📚 Verbal", cmd: "/verbal" },
      { text: "💻 Technical", cmd: "/technical" },
      { text: "📝 Full Mock Exam", cmd: "/mock" },
      { text: "📈 View Progress", cmd: "/progress" }
    ];
    appendBotBubble(html, buttons);
  }

  function sendMockInvitation() {
    const html = `
      <p>🎯 <strong>Placement Mock Assessment</strong></p>
      <p>Simulate an authentic company online test (TCS, Infosys, Wipro, Cognizant pattern) with:</p>
      <ul style="padding-left:20px; margin-bottom:8px;">
        <li>⏱️ 15 Minutes Countdown Timer</li>
        <li>📑 Multi-domain Questions (Aptitude, Reasoning, Technical)</li>
        <li>📊 Comprehensive Analysis & Readiness Scorecard</li>
      </ul>
      <p>Click below to open the dedicated Quiz Simulator:</p>
    `;
    const buttons = [
      { text: "🚀 Launch Quiz Now", cmd: "GO_TO_QUIZ" }
    ];
    appendBotBubble(html, buttons);
  }

  function sendProgressCard() {
    const profile = JSON.parse(localStorage.getItem("placebot_profile") || "{}");
    const totalSolved = profile.totalSolved || 142;
    const accuracy = profile.overallAccuracy || 78;
    const streak = profile.streakDays || 5;

    const html = `
      <p>📊 <strong>Your PlaceBot Performance Report</strong></p>
      <div style="background:#f8fafc; border-radius:8px; padding:12px; margin:8px 0; border:1px solid var(--border-color);">
        <div>🔥 <strong>Placement Prep Streak:</strong> ${streak} Days</div>
        <div>✅ <strong>Total Questions Solved:</strong> ${totalSolved}</div>
        <div>🎯 <strong>Overall Accuracy:</strong> ${accuracy}%</div>
        <div>🏆 <strong>Current Level:</strong> ${profile.levelTitle || "Placement Ready Associate"}</div>
      </div>
      <p>Ready to level up further?</p>
    `;
    const buttons = [
      { text: "📈 Open Full Dashboard", cmd: "GO_TO_PROGRESS" },
      { text: "🔢 Practice Aptitude", cmd: "/aptitude" }
    ];
    appendBotBubble(html, buttons);
  }

  function sendHelpMessage() {
    const html = `
      <p>💡 <strong>PlaceBot Commands Reference</strong></p>
      <ul style="padding-left:20px; margin-bottom:8px; font-size:0.88rem; line-height:1.7;">
        <li><code>/start</code> - Display main menu and modules</li>
        <li><code>/aptitude</code> - Quantitative aptitude practice</li>
        <li><code>/reasoning</code> - Logical and analytical reasoning</li>
        <li><code>/verbal</code> - Verbal ability and English grammar</li>
        <li><code>/technical</code> - C++, Java, Python, SQL & DSA</li>
        <li><code>/mock</code> - Launch timed placement mock test</li>
        <li><code>/progress</code> - Check accuracy and preparation stats</li>
        <li><code>/clear</code> - Clear current chat screen</li>
      </ul>
    `;
    appendBotBubble(html);
  }

  function sendBotMessage(text, inlineButtons = []) {
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    appendBotBubble(`<p>${formatted}</p>`, inlineButtons);
  }

  function clearChatMessages() {
    messagesViewport.innerHTML = `
      <div class="chat-date-pill">TODAY</div>
      <div class="msg-row incoming">
        <div class="msg-bubble">
          <div class="msg-text-content">
            <p>🧹 Chat cleared. Type <code>/start</code> to begin anytime!</p>
          </div>
          <div class="bubble-footer">
            <span>${getFormattedCurrentTime()}</span>
          </div>
        </div>
      </div>
    `;
  }

  function updateUserMetrics(categoryKey, wasCorrect) {
    try {
      const data = JSON.parse(localStorage.getItem("placebot_profile") || "{}");
      data.totalSolved = (data.totalSolved || 0) + 1;
      if (data.categories && data.categories[categoryKey]) {
        data.categories[categoryKey].solved += 1;
        if (wasCorrect) data.categories[categoryKey].correct += 1;
      }
      localStorage.setItem("placebot_profile", JSON.stringify(data));
    } catch (e) {}
  }

  function scrollToBottom() {
    messagesViewport.scrollTop = messagesViewport.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Intercept special navigation buttons
  window.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;
    const onclickAttr = target.getAttribute("onclick");
    if (onclickAttr && onclickAttr.includes("GO_TO_QUIZ")) {
      window.location.href = "quiz.html";
    } else if (onclickAttr && onclickAttr.includes("GO_TO_PROGRESS")) {
      window.location.href = "progress.html";
    }
  });
});
