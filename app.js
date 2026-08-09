const STORAGE_KEY = "saveflow-v2";

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  goal: 100000,
  goalName: "My Savings Goal",
  saved: 0,
  deposits: [],
  days: [],
  dark: false
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function money(value) {
  return "₦" + Number(value).toLocaleString("en-NG");
}

function updateDashboard() {

  const goal = Number(data.goal) || 1;
  const saved = Number(data.saved) || 0;

  const remaining = Math.max(goal - saved, 0);

  const percent = Math.min(
    Math.round((saved / goal) * 100),
    100
  );

  document.getElementById("goalName").textContent =
    data.goalName || "My Savings Goal";

  document.getElementById("savedBig").textContent =
    money(saved);

  document.getElementById("goalBig").textContent =
    money(goal);

  document.getElementById("saved").textContent =
    money(saved);

  document.getElementById("remaining").textContent =
    money(remaining);

  document.getElementById("percent").textContent =
    percent + "%";

  document.getElementById("progressText").textContent =
    percent + "% complete • " +
    money(remaining) +
    " remaining";

  document.getElementById("bar").style.width =
    percent + "%";

  const ring = document.getElementById("ring");

  ring.style.setProperty(
    "--angle",
    (percent * 3.6) + "deg"
  );

  document.getElementById("count").textContent =
    data.deposits.length;

  document.getElementById("streak").textContent =
    data.days.length + " 🔥";

  document.getElementById("daysDone").textContent =
    data.days.length + " / 30";

  renderDays();
  renderHistory();
  updateAchievement();
}


function renderDays() {

  const container = document.getElementById("days");

  container.innerHTML = "";

  for (let i = 1; i <= 30; i++) {

    const button = document.createElement("button");

    button.className = "day";

    if (data.days.includes(i)) {
      button.classList.add("done");
    }

    button.innerHTML =
      "<small>DAY</small><b>" + i + "</b>";

    button.addEventListener("click", function () {

      if (data.days.includes(i)) {

        data.days = data.days.filter(
          day => day !== i
        );

      } else {

        data.days.push(i);

      }

      saveData();
      updateDashboard();

    });

    container.appendChild(button);
  }
}


function renderHistory() {

  const rows = document.getElementById("historyRows");

  const empty = document.getElementById("empty");

  rows.innerHTML = "";

  if (data.deposits.length === 0) {

    empty.style.display = "block";

    return;
  }

  empty.style.display = "none";

  const deposits =
    [...data.deposits].reverse();

  deposits.forEach(deposit => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${deposit.date}</td>
      <td>${deposit.note || "Savings"}</td>
      <td><strong>${money(deposit.amount)}</strong></td>
    `;

    rows.appendChild(row);

  });
}


function updateAchievement() {

  const title =
    document.getElementById("achievementTitle");

  const text =
    document.getElementById("achievementText");

  if (data.saved >= data.goal && data.goal > 0) {

    title.textContent =
      "Goal completed! 🎉";

    text.textContent =
      "Amazing! You reached your savings goal.";

  } else if (data.saved > 0) {

    title.textContent =
      "You're making progress! 🌱";

    text.textContent =
      "Every deposit brings you closer to your goal.";

  } else {

    title.textContent =
      "First step";

    text.textContent =
      "Add your first deposit to unlock your first achievement.";

  }
}


/* ADD SAVINGS */

document
  .getElementById("depositForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const amount =
      Number(document.getElementById("amount").value);

    const note =
      document.getElementById("note").value.trim();

    if (!amount || amount <= 0) {

      alert("Please enter a valid amount.");

      return;
    }

    data.saved += amount;

    data.deposits.push({

      amount: amount,

      note: note,

      date: new Date().toLocaleDateString(
        "en-NG"
      )

    });

    saveData();

    this.reset();

    updateDashboard();

    alert(
      "Savings added successfully! 🎉"
    );

});


/* UPDATE GOAL */

document
  .getElementById("goalForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
      document
        .getElementById("goalInputName")
        .value
        .trim();

    const amount =
      Number(
        document.getElementById("goalInput").value
      );

    if (!amount || amount <= 0) {

      alert("Please enter a valid goal amount.");

      return;
    }

    data.goal = amount;

    if (name) {
      data.goalName = name;
    }

    saveData();

    updateDashboard();

    alert(
      "Your savings goal has been updated! 🎯"
    );

});


/* QUICK CHALLENGE BUTTONS */

document
  .querySelectorAll("[data-goal]")
  .forEach(button => {

    button.addEventListener("click", function() {

      const amount =
        Number(this.dataset.goal);

      data.goal = amount;

      data.goalName =
        "₦" +
        amount.toLocaleString("en-NG") +
        " Savings Challenge";

      saveData();

      updateDashboard();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

});


/* ADD SAVINGS BUTTON */

document
  .getElementById("addTop")
  .addEventListener("click", function() {

    document
      .getElementById("add")
      .scrollIntoView({
        behavior: "smooth"
      });

    setTimeout(function() {

      document
        .getElementById("amount")
        .focus();

    }, 500);

});


/* DARK MODE */

document
  .getElementById("themeBtn")
  .addEventListener("click", function() {

    data.dark = !data.dark;

    document.body.classList.toggle(
      "dark",
      data.dark
    );

    this.textContent =
      data.dark ? "☀" : "☾";

    saveData();

});


/* RESET */

document
  .getElementById("reset")
  .addEventListener("click", function() {

    const confirmed =
      confirm(
        "Are you sure you want to reset all your savings data?"
      );

    if (!confirmed) return;

    data = {
      goal: 100000,
      goalName: "My Savings Goal",
      saved: 0,
      deposits: [],
      days: [],
      dark: false
    };

    saveData();

    document.body.classList.remove("dark");

    document.getElementById("themeBtn").textContent =
      "☾";

    updateDashboard();

});


/* START */

if (data.dark) {

  document.body.classList.add("dark");

  document.getElementById("themeBtn").textContent =
    "☀";

}

document.getElementById("goalInput").value =
  data.goal;

document.getElementById("goalInputName").value =
  data.goalName;

updateDashboard();
