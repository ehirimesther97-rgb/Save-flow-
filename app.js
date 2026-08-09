/* =========================================
   SaveFlow V4
   Savings tracker
========================================= */

const STORAGE_KEY = "saveflow-v4";

const defaultData = {
  goal: 100000,
  goalName: "My Savings Goal",
  saved: 0,
  streak: 0,
  challenge: {},
  transactions: [],
  darkMode: false
};

let data = loadData();

/* =========================================
   STORAGE
========================================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...defaultData };
    }

    return {
      ...defaultData,
      ...JSON.parse(saved)
    };
  } catch (error) {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =========================================
   HELPERS
========================================= */

function money(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function getPercent() {
  if (!data.goal || data.goal <= 0) return 0;

  return Math.min(
    100,
    Math.round((data.saved / data.goal) * 100)
  );
}

function getRemaining() {
  return Math.max(0, data.goal - data.saved);
}

/* =========================================
   UPDATE WEBSITE
========================================= */

function updateUI() {
  const percent = getPercent();
  const remaining = getRemaining();

  document.querySelectorAll("[data-saved]").forEach(el => {
    el.textContent = money(data.saved);
  });

  document.querySelectorAll("[data-goal]").forEach(el => {
    el.textContent = money(data.goal);
  });

  document.querySelectorAll("[data-remaining]").forEach(el => {
    el.textContent = money(remaining);
  });

  document.querySelectorAll("[data-percent]").forEach(el => {
    el.textContent = percent + "%";
  });

  document.querySelectorAll("[data-streak]").forEach(el => {
    el.textContent = data.streak;
  });

  document.querySelectorAll("[data-goal-name]").forEach(el => {
    el.textContent = data.goalName;
  });

  document.querySelectorAll("[data-progress]").forEach(el => {
    el.style.width = percent + "%";
  });

  updateChallenge();

  updateHistory();

  updateAchievement();

  updateTheme();

  saveData();
}

/* =========================================
   ADD SAVINGS
========================================= */

function addSavings(amount) {
  amount = Number(amount);

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  data.saved += amount;

  data.transactions.unshift({
    amount: amount,
    date: new Date().toISOString()
  });

  data.streak += 1;

  saveData();

  updateUI();

  closeModal();

  alert(
    "🎉 Great job!\n\nYou saved " +
    money(amount) +
    "!"
  );
}

/* =========================================
   SAVINGS MODAL
========================================= */

const savingsModal =
  document.getElementById("savingsModal");

const savingAmount =
  document.getElementById("savingAmount");

function openSavingsModal() {
  if (!savingsModal) return;

  savingsModal.classList.add("show");
  savingsModal.setAttribute("aria-hidden", "false");

  if (savingAmount) {
    savingAmount.value = "";
    setTimeout(() => savingAmount.focus(), 100);
  }
}

function closeModal() {
  if (!savingsModal) return;

  savingsModal.classList.remove("show");
  savingsModal.setAttribute("aria-hidden", "true");
}

/* =========================================
   ADD SAVINGS BUTTONS
========================================= */

document
  .querySelectorAll("[data-add-savings]")
  .forEach(button => {
    button.addEventListener("click", openSavingsModal);
  });

/* =========================================
   SAVE BUTTON
========================================= */

const saveSavingsButton =
  document.getElementById("saveSavings");

if (saveSavingsButton) {
  saveSavingsButton.addEventListener("click", () => {
    addSavings(savingAmount.value);
  });
}

/* =========================================
   CLOSE MODAL
========================================= */

document
  .querySelectorAll("[data-close-modal]")
  .forEach(button => {
    button.addEventListener("click", closeModal);
  });

if (savingsModal) {
  savingsModal.addEventListener("click", event => {
    if (event.target === savingsModal) {
      closeModal();
    }
  });
}

/* =========================================
   ENTER KEY FOR SAVINGS
========================================= */

if (savingAmount) {
  savingAmount.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addSavings(savingAmount.value);
    }
  });
}

/* =========================================
   SET GOAL
========================================= */

function setGoal() {
  const currentGoal = data.goal;

  const newGoal = prompt(
    "Enter your new savings goal:",
    currentGoal
  );

  if (newGoal === null) return;

  const amount = Number(
    String(newGoal).replace(/,/g, "")
  );

  if (!amount || amount <= 0) {
    alert("Please enter a valid goal.");
    return;
  }

  data.goal = amount;

  saveData();

  updateUI();

  alert(
    "🎯 Your new goal is " +
    money(amount)
  );
}

document
  .querySelectorAll("[data-set-goal]")
  .forEach(button => {
    button.addEventListener("click", setGoal);
  });

/* =========================================
   RENAME GOAL
========================================= */

function renameGoal() {
  const newName = prompt(
    "Give your savings goal a name:",
    data.goalName
  );

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    alert("Please enter a name.");
    return;
  }

  data.goalName = cleanName;

  saveData();

  updateUI();
}

document
  .querySelectorAll("[data-rename-goal]")
  .forEach(button => {
    button.addEventListener("click", renameGoal);
  });

/* =========================================
   30-DAY CHALLENGE
========================================= */

function updateChallenge() {
  document
    .querySelectorAll(".challenge-day")
    .forEach(button => {

      const day = button.dataset.day;

      if (data.challenge[day]) {
        button.classList.add("completed");

        const strong =
          button.querySelector("strong");

        if (strong) {
          strong.textContent = "✓ SAVED";
        }
      } else {
        button.classList.remove("completed");

        const strong =
          button.querySelector("strong");

        if (strong) {
          strong.textContent = "₦1,000";
        }
      }
    });
}

document
  .querySelectorAll(".challenge-day")
  .forEach(button => {

    button.addEventListener("click", () => {

      const day = button.dataset.day;

      if (data.challenge[day]) {
        alert(
          "Day " +
          day +
          " is already completed! ✅"
        );

        return;
      }

      const confirmSave = confirm(
        "Mark Day " +
        day +
        " as completed?\n\n" +
        "This will add ₦1,000 to your savings."
      );

      if (!confirmSave) return;

      data.challenge[day] = true;

      data.saved += 1000;

      data.streak += 1;

      data.transactions.unshift({
        amount: 1000,
        date: new Date().toISOString(),
        note: "30-Day Challenge — Day " + day
      });

      saveData();

      updateUI();

      alert(
        "🔥 Day " +
        day +
        " completed!\n\n" +
        "₦1,000 added to your savings."
      );
    });
  });

/* =========================================
   HISTORY
========================================= */

function updateHistory() {
  const container =
    document.getElementById("transactions");

  if (!container) return;

  if (!data.transactions.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>No savings recorded yet.</p>
        <span>
          Your savings activity will appear here.
        </span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.transactions
      .slice(0, 20)
      .map(transaction => {

        const date =
          new Date(transaction.date);

        const formattedDate =
          date.toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });

        return `
          <div class="transaction">
            <div>
              <strong>
                ${transaction.note || "Savings added"}
              </strong>

              <small>
                ${formattedDate}
              </small>
            </div>

            <strong>
              +${money(transaction.amount)}
            </strong>
          </div>
        `;

      })
      .join("");
}

/* =========================================
   ACHIEVEMENTS
========================================= */

function updateAchievement() {
  const title =
    document.getElementById("achievementTitle");

  const text =
    document.getElementById("achievementText");

  if (!title || !text) return;

  if (data.saved >= data.goal && data.goal > 0) {

    title.textContent =
      "Goal Champion 🏆";

    text.textContent =
      "Amazing! You've reached your savings goal.";

  } else if (data.saved >= 50000) {

    title.textContent =
      "Halfway Hero 🌟";

    text.textContent =
      "You've saved at least ₦50,000. Keep going!";

  } else if (data.saved >= 10000) {

    title.textContent =
      "Savings Builder 💪";

    text.textContent =
      "You've saved ₦10,000 or more. Great progress!";

  } else if (data.saved > 0) {

    title.textContent =
      "First Step 🌱";

    text.textContent =
      "You've started your savings journey. Keep going!";

  } else {

    title.textContent =
      "Your First Step";

    text.textContent =
      "Add your first savings to unlock your first achievement.";
  }
}

/* =========================================
   DARK MODE
========================================= */

function updateTheme() {
  document.body.classList.toggle(
    "dark",
    data.darkMode
  );

  document
    .querySelectorAll("[data-dark-mode]")
    .forEach(button => {

      button.textContent =
        data.darkMode
          ? "☀️ Light mode"
          : "🌙 Dark mode";
    });

  const themeButton =
    document.getElementById("themeBtn");

  if (themeButton) {
    themeButton.textContent =
      data.darkMode ? "☀️" : "🌙";
  }
}

function toggleDarkMode() {
  data.darkMode = !data.darkMode;

  saveData();

  updateTheme();
}

document
  .querySelectorAll("[data-dark-mode]")
  .forEach(button => {
    button.addEventListener(
      "click",
      toggleDarkMode
    );
  });

/* =========================================
   BACKUP / EXPORT
========================================= */

function exportData() {
  const backup = {
    app: "SaveFlow",
    version: "V4",
    exportedAt: new Date().toISOString(),
    data: data
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: "application/json"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "saveflow-backup.json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

document
  .querySelectorAll("[data-export]")
  .forEach(button => {
    button.addEventListener(
      "click",
      exportData
    );
  });

/* =========================================
   RESET
========================================= */

function resetProgress() {

  const confirmed =
    confirm(
      "Are you sure you want to reset SaveFlow?\n\n" +
      "This will remove your savings, challenge progress, " +
      "history, and streak."
    );

  if (!confirmed) return;

  data = {
    ...defaultData,
    challenge: {},
    transactions: []
  };

  saveData();

  updateUI();

  alert(
    "SaveFlow has been reset."
  );
}

document
  .querySelectorAll("[data-reset]")
  .forEach(button => {
    button.addEventListener(
      "click",
      resetProgress
    );
  });

/* =========================================
   NAVIGATION
========================================= */

document
  .querySelectorAll(".main-nav a")
  .forEach(link => {

    link.addEventListener("click", () => {

      const target =
        document.querySelector(
          link.getAttribute("href")
        );

      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }

    });

  });

/* =========================================
   START APP
========================================= */

updateUI();

console.log(
  "SaveFlow V4 loaded successfully."
);
