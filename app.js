const STORAGE_KEY = "saveflow-v3";

const defaultData = {
  goal: 100000,
  goalName: "My Savings Goal",
  saved: 0,
  streak: 0,
  completedDays: [],
  transactions: [],
  darkMode: false
};

let data = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
  } catch (error) {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function money(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function percent() {
  if (!data.goal || data.goal <= 0) return 0;
  return Math.min(100, Math.round((data.saved / data.goal) * 100));
}

function updateUI() {
  const percentage = percent();
  const remaining = Math.max(0, data.goal - data.saved);

  const goalElements = document.querySelectorAll("[data-goal]");
  goalElements.forEach(el => el.textContent = money(data.goal));

  const savedElements = document.querySelectorAll("[data-saved]");
  savedElements.forEach(el => el.textContent = money(data.saved));

  const remainingElements = document.querySelectorAll("[data-remaining]");
  remainingElements.forEach(el => el.textContent = money(remaining));

  const percentElements = document.querySelectorAll("[data-percent]");
  percentElements.forEach(el => el.textContent = percentage + "%");

  const goalNameElements = document.querySelectorAll("[data-goal-name]");
  goalNameElements.forEach(el => el.textContent = data.goalName);

  const streakElements = document.querySelectorAll("[data-streak]");
  streakElements.forEach(el => el.textContent = data.streak);

  const progressBars = document.querySelectorAll("[data-progress]");
  progressBars.forEach(bar => {
    bar.style.width = percentage + "%";
  });

  document.body.classList.toggle("dark", data.darkMode);

  updateChallenge();
  updateTransactions();
  updateAchievement();
}

function addSavings() {
  const amountInput = document.getElementById("savingAmount");

  if (!amountInput) {
    openSavingsModal();
    return;
  }

  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid savings amount.");
    return;
  }

  data.saved += amount;

  data.transactions.unshift({
    amount,
    date: new Date().toLocaleDateString("en-NG"),
    time: new Date().toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  saveData();
  updateUI();

  closeModal();

  alert(
    "Great job! 🎉 You saved " +
    money(amount) +
    "."
  );
}

function openSavingsModal() {
  const modal = document.getElementById("savingsModal");

  if (modal) {
    modal.classList.add("show");

    const input = document.getElementById("savingAmount");

    if (input) {
      input.focus();
    }

    return;
  }

  const amount = prompt("How much did you save today?");

  if (amount === null) return;

  const value = Number(amount);

  if (!value || value <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  data.saved += value;

  data.transactions.unshift({
    amount: value,
    date: new Date().toLocaleDateString("en-NG"),
    time: new Date().toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  saveData();
  updateUI();

  alert("Amazing! 🎉 You saved " + money(value));
}

function closeModal() {
  const modal = document.getElementById("savingsModal");

  if (modal) {
    modal.classList.remove("show");
  }

  const input = document.getElementById("savingAmount");

  if (input) {
    input.value = "";
  }
}

function setGoal() {
  const newGoal = prompt(
    "Enter your new savings goal:",
    data.goal
  );

  if (newGoal === null) return;

  const amount = Number(newGoal);

  if (!amount || amount <= 0) {
    alert("Please enter a valid goal.");
    return;
  }

  data.goal = amount;

  saveData();
  updateUI();

  alert("Your new goal is " + money(amount) + " 🎯");
}

function renameGoal() {
  const name = prompt(
    "What would you like to call your savings goal?",
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
  updateUI();
}

function completeDay(day) {
  const index = data.completedDays.indexOf(day);

  if (index === -1) {
    data.completedDays.push(day);
    data.streak += 1;
  } else {
    data.completedDays.splice(index, 1);
    data.streak = Math.max(0, data.streak - 1);
  }

  saveData();
  updateUI();
}

function updateChallenge() {
  const days = document.querySelectorAll("[data-day]");

  days.forEach(dayElement => {
    const day = Number(dayElement.dataset.day);

    if (data.completedDays.includes(day)) {
      dayElement.classList.add("completed");
      dayElement.setAttribute("aria-pressed", "true");
    } else {
      dayElement.classList.remove("completed
