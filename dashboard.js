/************************
  AUTH GUARD
*************************/
if (!isAuthenticated()) {
  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Segoe UI,sans-serif;
    ">
      <div style="text-align:center">
        <h2>Please log in</h2>
        <p>You must be logged in to access this page.</p>
        <a href="login.html" style="
          display:inline-block;
          margin-top:1rem;
          padding:.6rem 1.2rem;
          background:#2563eb;
          color:#fff;
          border-radius:8px;
          text-decoration:none;
        ">
          Go to Login
        </a>
      </div>
    </div>
  `;
  throw new Error("Not authenticated");
}

/************************
  INIT
*************************/
document.addEventListener("DOMContentLoaded", () => {
  syncUserFromStorage();
  checkForNewMonth();
  updateDashboardUI();
  renderUpcomingPayments();
  renderSpendingChart();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncUserFromStorage();
    checkForNewMonth();
    updateDashboardUI();
    renderUpcomingPayments();
    renderSpendingChart();
  }
});

/************************
  ADVICE
*************************/
function getMonthlyAdvice(category) {
  const advice = {
    Food: "🍱 Try avoiding outside meals to avoid overspending.",
    Transport: "🚌 Consider public transport to reduce travel costs.",
    Entertainment: "🎬 Plan entertainment in a budget-friendly way.",
    Shopping: "🛍️ Avoid impulse buying and unnecessary purchases.",
    SIP: "📈 Great job investing! Consistency builds wealth.",
    Payback: "💳 Paying back promptly helps maintain stability.",
    Others: "📊 Review this category to align spending with goals."
  };
  return advice[category] || "Review this category and consider setting a limit.";
}

/************************
  AUTOMATIC MONTH SWITCH
*************************/
function checkForNewMonth() {
  if (!user) return;

  const newMonth = new Date().toISOString().slice(0, 7);
  if (user.currentMonth === newMonth) return;

  const previousMonth = user.currentMonth;
  const prevData = user.months[previousMonth];

  if (!prevData) {
    user.currentMonth = newMonth;
    saveUser();
    return;
  }

  const baseBudget = getMonthlyBudget();
  const extraTotal = prevData.extraFunds.reduce((sum, fund) => sum + fund.amount, 0);
  const totalSpent = prevData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const effectiveBudget = baseBudget + extraTotal;
  const previousRemaining = effectiveBudget - totalSpent;

  user.currentMonth = newMonth;

  if (!user.months[newMonth]) {
    user.months[newMonth] = { expenses: [], extraFunds: [] };
  }

  if (previousRemaining > 0) {
    user.months[newMonth].extraFunds.push({
      amount: previousRemaining,
      note: "Carry Forward",
      date: new Date().toISOString()
    });
  }

  saveUser();
}

/************************
  DASHBOARD UI
*************************/
function updateDashboardUI() {
  if (!user) return;

  const cards = document.querySelectorAll(".card .amount");
  const balanceEl = cards[0];
  const spentEl = document.querySelector(".amount.expense");
  const topCategoryEl = cards[2];
  const savingsGoalEl = document.querySelector(".savings-goal");
  const budgetAmountEl = document.querySelector(".budget-amount");
  const percentEl = document.querySelector(".budget-text");
  const progressEl = document.querySelector(".progress-fill");
  const summaryEl = document.querySelector(".monthly-summary-text");

  if (!balanceEl || !spentEl || !summaryEl) return;

  if (!hasUserData()) {
    balanceEl.innerText = "—";
    spentEl.innerText = "—";
    topCategoryEl.innerText = "—";
    savingsGoalEl.innerText = "Add salary & savings";
    budgetAmountEl.innerText = "";
    percentEl.innerText = "";
    progressEl.style.width = "0%";
    summaryEl.innerText = "Add your salary and start tracking expenses.";
    return;
  }

  const baseBudget = getMonthlyBudget();
  const effectiveBudget = getEffectiveBudget();
  const spent = getTotalSpent();
  const remaining = getRemainingBalance();
  const percent = getSpentPercentage();
  const topCategory = getTopCategory();

  balanceEl.innerText = `₹${remaining}`;

  if (user.savingsTarget !== null) {
    savingsGoalEl.innerText = `Savings Goal: ₹${user.savingsTarget}`;
  } else {
    savingsGoalEl.innerText = "Savings goal not set";
  }

  spentEl.innerText = `₹${spent}`;

  const month = user.months[user.currentMonth];
  const extraTotal = month.extraFunds.reduce((sum, fund) => sum + fund.amount, 0);

  budgetAmountEl.innerHTML = `
    Monthly Budget: ₹${effectiveBudget}<br>
    <span style="font-size:12px; color:#64748b;">
      (Base: ₹${baseBudget} + Extra: ₹${extraTotal})
    </span>
  `;

  percentEl.innerText = `${percent}% of monthly budget used`;
  progressEl.style.width = `${percent}%`;
  progressEl.style.background =
    percent < 60 ? "#22c55e" : percent < 85 ? "#f59e0b" : "#ef4444";

  topCategoryEl.innerText = topCategory || "—";

  if (topCategory) {
    summaryEl.innerHTML = `
      💡 This month, your highest spending was on 
      <strong>${topCategory}</strong>.<br><br>
      ${getMonthlyAdvice(topCategory)}
    `;
  } else {
    summaryEl.innerText = "💡 Add expenses to see insights.";
  }
}

/************************
  UPCOMING PAYMENTS
*************************/
function renderUpcomingPayments() {
  const container = document.getElementById("upcomingPayments");
  if (!container || !user) return;

  container.innerHTML = "";

  if (!user.payments.length) {
    container.innerHTML = `<p class="empty">No upcoming payments.</p>`;
    return;
  }

  // ✅ Normalize today (no time issues)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ✅ Filter upcoming (next 10 days + overdue)
  const upcoming = user.payments.filter(p => {
    const [year, month, day] = p.dueDate.split("-");
    const due = new Date(year, month - 1, day);

    const diff = (due - today) / (1000 * 60 * 60 * 24);
    return diff <= 10;
  });

  if (!upcoming.length) {
    container.innerHTML = `<p class="empty">No upcoming payments.</p>`;
    return;
  }

  // ✅ Sort by date
  upcoming
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach(p => {

      // ✅ FIXED date parsing
      const [year, month, day] = p.dueDate.split("-");
      const due = new Date(year, month - 1, day);

      // ✅ Accurate day difference
      const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

      let status = "safe";
      let label = "";

      // ✅ Smart labels
      if (diffDays < 0) {
        status = "urgent";
        label = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`;
      } 
      else if (diffDays === 0) {
        status = "urgent";
        label = "Due today";
      } 
      else if (diffDays === 1) {
        status = "warning";
        label = "Tomorrow";
      } 
      else if (diffDays <= 3) {
        status = "urgent";
        label = `In ${diffDays} days`;
      } 
      else if (diffDays <= 7) {
        status = "warning";
        label = `In ${diffDays} days`;
      } 
      else {
        label = `In ${diffDays} days`;
      }

      const div = document.createElement("div");
      div.className = `payment ${status}`;
      div.innerHTML = `
        <span>${p.title}</span>
        <span class="due ${status}">₹${p.amount} · ${label}</span>
      `;

      container.appendChild(div);
    });
}

/************************
  SPENDING PIE CHART
*************************/
function renderSpendingChart() {
  if (!user) return;

  const month = user.months[user.currentMonth];
  if (!month || !month.expenses.length) return;

  const totals = {};
  month.expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  const colors = [
    "#7c3aed", "#3b82f6", "#10b981",
    "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"
  ];

  if (window._spendingChart) {
    window._spendingChart.destroy();
  }

  const canvas = document.getElementById("spendingChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  window._spendingChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 8
      }]
    },
    options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ₹${ctx.parsed} (${Math.round(ctx.parsed / data.reduce((a, b) => a + b, 0) * 100)}%)`
          }
        }
      }
    }
  });
 const legend = document.getElementById("chartLegend");
  if (!legend) return;
  legend.innerHTML = "";
  legend.style.display = "flex";
  legend.style.flexDirection = "column";
  legend.style.gap = "9px";

  labels.forEach((label, i) => {
    const total = data.reduce((a, b) => a + b, 0);
    const pct = Math.round(data[i] / total * 100);
    legend.innerHTML += `
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#4b5563;">
        <span style="width:10px;height:10px;border-radius:2px;background:${colors[i]};display:inline-block;flex-shrink:0;"></span>
        <span style="min-width:100px;">${label}</span>
        <span style="font-weight:500;color:#1e1b4b;">₹${data[i]} (${pct}%)</span>
      </div>
    `;
  });
}