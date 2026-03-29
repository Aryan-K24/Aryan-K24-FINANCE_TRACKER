/************************
  AUTH GUARD
*************************/
if (!isAuthenticated()) {
  window.location.href = "index.html";
}

/************************
  INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  renderExtraFunds();

  document
    .querySelector(".extra-form")
    ?.addEventListener("submit", handleAddExtraFunds);

  document
    .getElementById("extraFundsList")
    ?.addEventListener("click", handleExtraFundActions);
});

/************************
  ADD FUNDS
*************************/
function handleAddExtraFunds(e) {
  e.preventDefault();

  const amount = Number(
    document.getElementById("extra-amount").value
  );
  const note =
    document.getElementById("extra-note").value.trim();

  if (!amount || amount <= 0) return;

  const month = user.months[user.currentMonth];

  month.extraFunds.push({
    amount,
    note,
    date: new Date().toISOString()
  });

  saveUser();
  renderExtraFunds();
  e.target.reset();
}

/************************
  RENDER
*************************/
function renderExtraFunds() {
  const list = document.getElementById("extraFundsList");
  if (!list) return;

  list.innerHTML = "";

  const month = user.months[user.currentMonth];

  if (!month.extraFunds.length) {
    list.innerHTML =
      `<p class="empty">No extra funds added yet.</p>`;
    return;
  }

  month.extraFunds
    .slice()
    .reverse()
    .forEach((fund, reverseIndex) => {

      const realIndex =
        month.extraFunds.length - 1 - reverseIndex;

      const item = document.createElement("div");
      item.className = "extra-item";
      item.dataset.index = realIndex;

      item.innerHTML = `
        <div class="extra-card">
          <div class="extra-left">
            <p class="extra-date">${formatDate(fund.date)}</p>
            ${fund.note ? `<p class="extra-note">${fund.note}</p>` : ""}
          </div>

          <div class="extra-right">
            <p class="extra-amount">+ ₹${fund.amount}</p>
            <div class="extra-actions">
              <button data-action="edit">✏️</button>
              <button data-action="delete">🗑️</button>
            </div>
          </div>
        </div>

        <div class="extra-edit hidden">
          <input type="number" class="edit-amount" value="${fund.amount}" />
          <input type="text" class="edit-note" value="${fund.note || ""}" />
          <button data-action="save">✔</button>
          <button data-action="cancel">✖</button>
        </div>
      `;

      list.appendChild(item);
    });
}

/************************
  ACTIONS
*************************/
function handleExtraFundActions(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const item = btn.closest(".extra-item");
  const index = Number(item.dataset.index);

  const month = user.months[user.currentMonth];

  if (action === "delete") {
    if (!confirm("Delete this extra fund entry?")) return;

    month.extraFunds.splice(index, 1);
    saveUser();
    renderExtraFunds();
  }

  if (action === "edit") {
    item.querySelector(".extra-card").classList.add("hidden");
    item.querySelector(".extra-edit").classList.remove("hidden");
  }

  if (action === "cancel") {
    item.querySelector(".extra-edit").classList.add("hidden");
    item.querySelector(".extra-card").classList.remove("hidden");
  }

  if (action === "save") {
    const amount = Number(
      item.querySelector(".edit-amount").value
    );
    const note =
      item.querySelector(".edit-note").value.trim();

    if (!amount || amount <= 0) return;

    month.extraFunds[index] = {
      ...month.extraFunds[index],
      amount,
      note
    };

    saveUser();
    renderExtraFunds();
  }
}

/************************
  HELPERS
*************************/
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}