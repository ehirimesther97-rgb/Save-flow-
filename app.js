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

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function percentComplete() {
  if (!data.goal || data.goal <= 0) return 0;

  return Math.min(
    100,
    Math.round((data.saved / data.goal) * 100)
  );
}

function updateScreen() {
  const percent = percentComplete();
  const remaining = Math.max(0, data.goal - data.saved);

  document.querySelectorAll("[data-saved]").forEach(el => {
    el.textContent = formatMoney(data.saved);
  });

  document.querySelectorAll("[data-goal]").forEach(el => {
    el.textContent = formatMoney(data.goal);
  });

  document.querySelectorAll("[data-remaining]").forEach(el => {
    el.textContent = formatMoney(remaining);
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

  updateAchievement();
  updateChallenge();
  updateHistory();

  document.body.classList.toggle("dark", data.darkMode);
}

function addSavings() {
  const amountInput = document.getElementById("savingAmount");

  if (!amountInput) return;

  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid savings amount.");
    return;
  }

  data.saved += amount;

  data.transactions.unshift({
    amount,
    date: new Date().toLocaleString("en-NG")
  });

  data.streak += 1;

  saveData();
  updateScreen();

  amountInput.value = "";

  closeModal();

  alert(
    "🎉 Great job!\n\nYou saved " +
    formatMoney(amount) +
    "!"
  );
}

function setGoal() {
  const current = data.goal;

  const value = prompt(
    "Enter your new savings goal:",
    current
  );

  if (value === null) return;

  const goal = Number(value);

  if (!goal || goal <= 0) {
    alert("savings challenge");
    return;
  }

  data.goal = goal;

  saveData();
  updateScreen();
}

function renameGoal() {
  const name = prompt(
    "Give your savings goal a name:",
    data.goalName
  );

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    alert("Please enter a goal name.");
    return;
  }

  data.goalName = cleanName;

  saveData();
  updateScreen();
}

function toggleDarkMode() {
  data.darkMode = !data.darkMode;

  saveData();
  updateScreen();
}

function openModal() {
  const modal = document.getElementById("savingsModal");

  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const input = document.getElementById("savingAmount");

  if (input) {
    setTimeout(() => input.focus(), 100);
  }
}

function closeModal() {
  const modal = document.getElementById("savingsModal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function completeChallenge(day) {
  const key = String(day);

  if (data.challenge[key]) {
    data.challenge[key] = false;

    if (data.streak > 0) {
      data.streak -= 1;
    }
  } else {
    data.challenge[key] = true;
    data.streak += 1;
  }

  saveData();
  updateScreen();
}

function updateChallenge() {
  document.querySelectorAll(".challenge-day").forEach(button => {
    const day = button.dataset.day;

    if (data.challenge[day]) {
      button.classList.add("completed");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.classList.remove("completed");
      button.setAttribute("aria-pressed", "false");
    }
  });
}

function updateAchievement() {
  const title = document.getElementById("achievementTitle");
  const text = document.getElementById("achievementText");

  if (!title || !text) return;

  const percent = percentComplete();

  if (data.saved <= 0) {
    title.textContent = "Your First Step";
    text.textContent =
      "Add your first savings to unlock your first achievement.";
  } else if (percent >= 100) {
    title.textContent = "Goal Crusher 🏆";
    text.textContent =
      "Amazing! You reached your savings goal.";
  } else if (percent >= 75) {
    title.textContent = "Almost There 🔥";
    text.textContent =
      "You're more than 75% of the way to your goal!";
  } else if (percent >= 50) {
    title.textContent = "Halfway Hero ⭐";
    text.textContent =
      "You've reached at least half of your savings goal.";
  } else if (percent >= 25) {
    title.textContent = "Quarter Way Champion 💪";
    text.textContent =
      "You've saved 25% or more. Keep going!";
  } else {
    title.textContent = "First Step Unlocked 🎉";
    text.textContent =
      "You made your first saving. Keep building the habit!";
  }
}

function updateHistory() {
  const container = document.getElementById("transactions");

  if (!container) return;

  if (!data.transactions.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No savings recorded yet.</p>
        <span>Your savings activity will appear here.</span>
      </div>
    `;

    return;
  }

  container.innerHTML = data.transactions
    .slice(0, 20)
    .map(transaction => `
      <div class="transaction">
        <div>
          <strong>+ ${formatMoney(transaction.amount)}</strong>
          <small>${transaction.date}</small>
        </div>
        <span>💰</span>
      </div>
    `)
    .join("");
}

function exportData() {
  const backup = JSON.stringify(data, null, 2);

  const blob = new Blob(
    [backup],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "saveflow-backup.json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

function resetProgress() {
  const confirmed = confirm(
    "Are you sure you want to reset your SaveFlow progress?\n\nThis cannot be undone."
  );

  if (!confirmed) return;

  data = { ...defaultData };

  saveData();
  updateScreen();

  alert("SaveFlow has been reset.");
}

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-add-savings]").forEach(button => {
    button.addEventListener("click", openModal);
  });

  document.querySelectorAll("[data-set-goal]").forEach(button => {
    button.addEventListener("click", setGoal);
  });

  document.querySelectorAll("[data-rename-goal]").forEach(button => {
    button.addEventListener("click", renameGoal);
  });

  document.querySelectorAll("[data-dark-mode]").forEach(button => {
    button.addEventListener("click", toggleDarkMode);
  });

  document.querySelectorAll("[data-export]").forEach(button => {
    button.addEventListener("click", exportData);
  });

  document.querySelectorAll("[data-reset]").forEach(button => {
    button.addEventListener("click", resetProgress);
  });

  document.querySelectorAll(".challenge-day").forEach(button => {
    button.addEventListener("click", () => {
      completeChallenge(button.dataset.day);
    });
  });

  const saveButton = document.getElementById("saveSavings");

  if (saveButton) {
    saveButton.addEventListener("click", addSavings);
  }

  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeModal);
  });

  const modal = document.getElementById("savingsModal");

  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  updateScreen();
});
