document.addEventListener("DOMContentLoaded", () => {
  if (!appReady || !user) return;

  const form = document.querySelector(".settings-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input");
  const salaryInput = inputs[0];
  const savingsInput = inputs[1];
  const btn = form.querySelector(".save-btn");

  // Prefill
  if (user.salary !== null) salaryInput.value = user.salary;
  if (user.savingsTarget !== null)
    savingsInput.value = user.savingsTarget;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const salary = Number(salaryInput.value);
    const savings = Number(savingsInput.value);

    if (!salary || salary <= 0) {
      alert("Enter a valid salary");
      return;
    }

    if (savings < 0 || savings >= salary) {
      alert("Savings must be less than salary");
      return;
    }

    user.salary = salary;
    user.savingsTarget = savings;
    saveUser();

    btn.innerText = "Saved ✓";
    setTimeout(() => {
      btn.innerText = "Save Changes";
    }, 1200);
  });
});
