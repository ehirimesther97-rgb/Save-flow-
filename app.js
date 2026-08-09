const STORAGE_KEY = "saveflow-data";

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  goal: 100000,
  saved: 0,
  days: Array(30).fill(false),
  deposits: []
};

function money(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function render() {

  document.getElementById("goal").textContent =
    money(data.goal);

  document.getElementById("saved").textContent =
    money(data.saved);

  document.getElementById("remaining").textContent =
    money(Math.max(0, data.goal - data.saved));

  const percentage =
    Math.min(100, Math.round((data.saved / data.goal) * 100));

  document.getElementById("percentage").textContent =
    percentage + "%";

  document
    .getElementById("progressRing")
    .style.setProperty(
      "--angle",
      percentage * 3.6 + "deg"
    );


  /* STREAK */

  let streak = 0;

  for (
    let i = data.days.length - 1;
    i >= 0 && data.days[i];
    i--
  ) {
    streak++;
  }

  document.getElementById("streak").textContent =
    streak +
    " day" +
    (streak === 1 ? "" : "s") +
    " 🔥";


  /* GOAL INPUT */

  document.getElementById("goalInput").value =
    data.goal;


  /* 30 DAY CHALLENGE */

  const challenge =
    document.getElementById("challenge");

  challenge.innerHTML = "";

  data.days.forEach((completed, index) => {

    const day = document.createElement("div");

    day.className =
      "day" + (completed ? " done" : "");

    day.innerHTML = `
      <small>DAY ${index + 1}</small>
      <b>${completed ? "✓ Saved" : "Tap"}</b>
    `;

    day.onclick = function () {

      data.days[index] =
        !data.days[index];

      saveData();
    };

    challenge.appendChild(day);
  });


  /* SAVINGS HISTORY */

  const history =
    document.getElementById("history");

  history.innerHTML = "";

  document.getElementById("empty").style.display =
    data.deposits.length ? "none" : "block";

  [...data.deposits]
    .reverse()
    .forEach(deposit => {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${deposit.date}</td>
        <td>${escapeHTML(
          deposit.note || "Savings"
        )}</td>
        <td>
          <strong>
            ${money(deposit.amount)}
          </strong>
        </td>
      `;

      history.appendChild(row);
    });
}


/* PROTECTS THE PAGE FROM HTML ENTERED INTO NOTES */

function escapeHTML(text) {

  return text.replace(
    /[&<>"']/g,
    function(character) {

      const characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return characters[character];
    }
  );
}


/* ADD SAVINGS */

document
  .getElementById("depositForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const amount =
      Number(
        document.getElementById("amount").value
      );

    const note =
      document.getElementById("note").value.trim();

    if (!amount || amount <= 0) {
      return;
    }

    data.saved += amount;

    data.deposits.push({

      amount: amount,

      note: note,

      date: new Date().toLocaleDateString(
        "en-NG",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )

    });

    event.target.reset();

    saveData();
  });


/* UPDATE GOAL */

document
  .getElementById("goalForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const goal =
      Number(
        document.getElementById("goalInput").value
      );

    if (goal > 0) {

      data.goal = goal;

      saveData();
    }
  });


/* RESET */

document
  .getElementById("reset")
  .addEventListener("click", function() {

    const confirmed =
      confirm(
        "Are you sure you want to reset your savings progress?"
      );

    if (!confirmed) {
      return;
    }

    data = {

      goal: 100000,

      saved: 0,

      days: Array(30).fill(false),

      deposits: []

    };

    saveData();
  });


/* START WEBSITE */

render();
