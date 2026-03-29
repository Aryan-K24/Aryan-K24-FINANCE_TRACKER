/************************
  LOAD AUTH USER
*************************/
const currentUserEmail = localStorage.getItem("currentUser");
const users = JSON.parse(localStorage.getItem("users")) || {};

let user =
  currentUserEmail && users[currentUserEmail]
    ? users[currentUserEmail]
    : null;

const appReady = !!user;


/************************
  NORMALIZE USER
*************************/
function normalizeUser() {
  if (!user) return;

  // -------------------------
  // BASIC FIELDS
  // -------------------------

  user.salary =
    typeof user.salary === "number" && user.salary > 0
      ? user.salary
      : 0;

  user.savingsTarget =
    typeof user.savingsTarget === "number"
      ? user.savingsTarget
      : 0;

  user.payments = Array.isArray(user.payments)
    ? user.payments
    : [];

  // -------------------------
  // MONTH-BASED STORAGE SYSTEM
  // -------------------------

  const currentMonthKey =
    new Date().toISOString().slice(0, 7);

  user.months =
    user.months && typeof user.months === "object"
      ? user.months
      : {};

  user.currentMonth =
    typeof user.currentMonth === "string"
      ? user.currentMonth
      : currentMonthKey;

  // If month changed but not updated yet
  if (!user.months[user.currentMonth]) {
    user.months[user.currentMonth] = {
      expenses: [],
      extraFunds: []
    };
  }

  // Ensure structure safety
  const month = user.months[user.currentMonth];

  month.expenses = Array.isArray(month.expenses)
    ? month.expenses
    : [];

  month.extraFunds = Array.isArray(month.extraFunds)
    ? month.extraFunds
    : [];
}

normalizeUser();


/************************
  STORAGE
*************************/
function saveUser() {
  if (!appReady) return;

  users[currentUserEmail] = user;
  localStorage.setItem("users", JSON.stringify(users));
}

function syncUserFromStorage() {
  if (!currentUserEmail) return;

  const latestUsers =
    JSON.parse(localStorage.getItem("users")) || {};

  if (!latestUsers[currentUserEmail]) return;

  user = latestUsers[currentUserEmail];
  normalizeUser();
}


/************************
  USER DATA CHECK
*************************/
function hasUserData() {
  if (!appReady) return false;

  const month = user.months[user.currentMonth];

  return (
    user.salary > 0 ||
    month.expenses.length > 0 ||
    month.extraFunds.length > 0
  );
}


/************************
  CALCULATIONS
*************************/

// Base monthly spending budget
function getMonthlyBudget() {
  if (!user) return 0;

  return Math.max(
    user.salary - user.savingsTarget,
    0
  );
}


// Base + manual extra funds (CURRENT MONTH ONLY)
function getEffectiveBudget() {
  const baseBudget = getMonthlyBudget();

  const month = user.months[user.currentMonth];

  const extraTotal = month.extraFunds.reduce(
    (sum, fund) => sum + fund.amount,
    0
  );

  return baseBudget + extraTotal;
}


// Total spent (CURRENT MONTH ONLY)
function getTotalSpent() {
  const month = user.months[user.currentMonth];

  return month.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
}


// Remaining balance (CURRENT MONTH ONLY)
function getRemainingBalance() {
  return Math.max(
    getEffectiveBudget() - getTotalSpent(),
    0
  );
}


// Percentage used
function getSpentPercentage() {
  const budget = getEffectiveBudget();

  if (!budget) return 0;

  return Math.min(
    Math.round(
      (getTotalSpent() / budget) * 100
    ),
    100
  );
}


// Top spending category (CURRENT MONTH ONLY)
function getTopCategory() {
  const month = user.months[user.currentMonth];

  if (!month.expenses.length) return null;

  const totals = {};

  month.expenses.forEach(exp => {
    totals[exp.category] =
      (totals[exp.category] || 0) + exp.amount;
  });

  return Object.keys(totals).reduce((a, b) =>
    totals[a] > totals[b] ? a : b
  );
}