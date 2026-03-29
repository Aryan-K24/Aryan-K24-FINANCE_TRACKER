/************************
  AUTH GUARD
*************************/
if (!isAuthenticated()) {
  document.body.innerHTML = `<a href="index.html">Login</a>`;
  throw new Error("Not authenticated");
}

/************************
  INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  renderExpenses();

  document
    .querySelector(".expense-form")
    ?.addEventListener("submit", handleAddExpense);

  document
    .getElementById("recentExpenses")
    ?.addEventListener("click", handleExpenseActions);
});

/************************
  ADD EXPENSE
*************************/
function handleAddExpense(e) {
  e.preventDefault();

  const amount = Number(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const note = document.getElementById("expense-note").value.trim();

  if (!amount || amount <= 0 || !category) return;

  const month = user.months[user.currentMonth];

  month.expenses.push({
    amount,
    category,
    note,
    date: new Date().toISOString()
  });

  saveUser();
  renderExpenses();
  e.target.reset();
}

/************************
  RENDER EXPENSES
*************************/
function renderExpenses() {
  const list = document.getElementById("recentExpenses");
  if (!list) return;

  list.innerHTML = "";

  const month = user.months[user.currentMonth];

  if (!month.expenses.length) {
    list.innerHTML = `<p class="empty">No expenses added yet.</p>`;
    return;
  }

  month.expenses
    .slice()
    .reverse()
    .forEach((exp, reverseIndex) => {

      const realIndex =
        month.expenses.length - 1 - reverseIndex;

      const item = document.createElement("div");
      item.className = "expense-item";
      item.dataset.index = realIndex;

      item.innerHTML = `
        <div class="expense-view">
          <div>
            <p class="expense-category">${exp.category}</p>
            <p class="expense-date">${formatDate(exp.date)}</p>
            ${exp.note ? `<p class="expense-note">${exp.note}</p>` : ""}
          </div>

          <div class="expense-actions">
            <p class="expense-amount">₹${exp.amount}</p>
            <button type="button" data-action="edit">✏️</button>
            <button type="button" data-action="delete">🗑️</button>
          </div>
        </div>

        <div class="expense-edit hidden">
          <select class="edit-category">
            ${["Food","Transport","Entertainment","Shopping","SIP","Payback","Others"]
              .map(c => `<option ${c === exp.category ? "selected" : ""}>${c}</option>`)
              .join("")}
          </select>

          <input type="number" class="edit-amount" step="0.01"  value="${exp.amount}" />
          <input type="text" class="edit-note" value="${exp.note || ""}" />

          <button type="button" data-action="save">✔</button>
          <button type="button" data-action="cancel">✖</button>
        </div>
      `;

      list.appendChild(item);
    });
}

/************************
  ACTION HANDLER
*************************/
function handleExpenseActions(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const item = btn.closest(".expense-item");
  const index = Number(item.dataset.index);

  const month = user.months[user.currentMonth];

  if (action === "delete") {
    if (!confirm("Delete this expense?")) return;

    month.expenses.splice(index, 1);
    saveUser();
    renderExpenses();
  }

  if (action === "edit") {
    closeAllEdits();
    item.querySelector(".expense-view").classList.add("hidden");
    item.querySelector(".expense-edit").classList.remove("hidden");
  }

  if (action === "cancel") {
    item.querySelector(".expense-edit").classList.add("hidden");
    item.querySelector(".expense-view").classList.remove("hidden");
  }

  if (action === "save") {
    const amount = Number(item.querySelector(".edit-amount").value);
    const category = item.querySelector(".edit-category").value;
    const note = item.querySelector(".edit-note").value.trim();

    if (!amount || amount <= 0) return;

    month.expenses[index] = {
      ...month.expenses[index],
      amount,
      category,
      note
    };

    saveUser();
    renderExpenses();
  }
}

/************************
  HELPERS
*************************/
function closeAllEdits() {
  document.querySelectorAll(".expense-edit")
    .forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".expense-view")
    .forEach(el => el.classList.remove("hidden"));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}