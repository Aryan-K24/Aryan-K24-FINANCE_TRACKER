/************************
 AUTH GUARD
*************************/
if (!isAuthenticated()) {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
      <a href="index.html">Go to Login</a>
    </div>
  `;
  throw new Error("Not authenticated");
}

/************************
 INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  renderHistory();

  document
    .getElementById("monthFilter")
    ?.addEventListener("change", renderHistory);

  document
    .getElementById("categoryFilter")
    ?.addEventListener("change", renderHistory);
});

/************************
 MAIN RENDER FUNCTION
*************************/
function renderHistory() {
  syncUserFromStorage();
  if (!user) return;

  const list = document.getElementById("historyList");
  const summaryBox = document.getElementById("monthlyReview");

  const selectedMonth =
    document.getElementById("monthFilter")?.value;

  const selectedCategory =
    document.getElementById("categoryFilter")?.value;

  // 🔥 Collect expenses from ALL months
  let expenses = Object.values(user.months)
    .flatMap(m => m.expenses);

  /* =========================
     FILTER BY MONTH
  ========================= */
  if (selectedMonth) {
    expenses = expenses.filter(e =>
      e.date?.startsWith(selectedMonth)
    );
  }

  /* =========================
     FILTER BY CATEGORY
  ========================= */
  if (selectedCategory && selectedCategory !== "all") {
    expenses = expenses.filter(
      e => e.category === selectedCategory
    );
  }

  /* =========================
     RESET UI
  ========================= */
  list.innerHTML = "";
  summaryBox.classList.add("hidden");

  if (!expenses.length) {
    list.innerHTML =
      `<p class="empty">No expenses found.</p>`;
    return;
  }

  /* =========================
     SORT & RENDER LIST
  ========================= */
  expenses.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  expenses.forEach(e => {
    list.innerHTML += `
      <div class="history-item">
        <div>
          <p class="category">${e.category}</p>
          <p class="date">${formatDate(e.date)}</p>
        </div>
        <p class="amount">₹${e.amount}</p>
      </div>
    `;
  });

  renderSummary(expenses, selectedMonth, selectedCategory, summaryBox);
}

/************************
 SUMMARY LOGIC
*************************/
function renderSummary(expenses, month, category, box) {

  const totalSpent = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  /* =========================
     CATEGORY MODE
  ========================= */
  if (category && category !== "all") {

    box.innerHTML = `
      <strong>${category} Summary</strong><br><br>
      Total ${category} Spent:
      <strong style="color:#dc2626">
        ₹${totalSpent}
      </strong>
    `;

    box.classList.remove("hidden");
    return;
  }

  /* =========================
     MONTH MODE
  ========================= */
  if (month) {

    // 🔥 Collect extra funds from all months
    const extraFundsAdded = Object.values(user.months)
      .flatMap(m => m.extraFunds)
      .filter(f => f.date?.startsWith(month))
      .reduce((sum, f) => sum + f.amount, 0);

    const categoryTotals = {};

    expenses.forEach(e => {
      categoryTotals[e.category] =
        (categoryTotals[e.category] || 0) + e.amount;
    });

    let topCategory = "—";
    let topCategoryValue = 0;

    if (Object.keys(categoryTotals).length) {
      topCategory = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      );
      topCategoryValue = categoryTotals[topCategory];
    }

    const baseBudget = getMonthlyBudget();
    const effectiveBudget = baseBudget + extraFundsAdded;
    const remaining = effectiveBudget - totalSpent;

    const target = user.savingsTarget || 0;

    let savingsResult = "";

    if (target > 0) {
      const extraSaved = remaining > 0 ? remaining : 0;
      const totalSaved = target + extraSaved;

      savingsResult = `
        Total Savings This Month:
        <strong style="color:#16a34a">
          ₹${totalSaved}
        </strong>
        <br>
        (Initial: ₹${target} + Extra: ₹${extraSaved})
      `;
    }

    box.innerHTML = `
      <strong>Monthly Overview (${month})</strong><br><br>

      Base Budget: ₹${baseBudget}<br>
      Extra Funds Added: ₹${extraFundsAdded}<br>
      Effective Budget: ₹${effectiveBudget}<br><br>

      Total Spent: ₹${totalSpent}<br>
      Remaining Balance: 
      <strong style="color:${remaining >= 0 ? "#16a34a" : "#dc2626"}">
        ₹${remaining}
      </strong><br><br>

      Top Category: 
      <strong>
        ${topCategory} (₹${topCategoryValue})
      </strong><br><br>

      Savings Target: ₹${target}<br>
      ${savingsResult}
    `;

    box.classList.remove("hidden");
    return;
  }

  box.classList.add("hidden");
}

/************************
 UTIL
*************************/
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}