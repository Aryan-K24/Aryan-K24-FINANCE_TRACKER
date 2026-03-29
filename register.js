document
  .getElementById("registerForm")
  .addEventListener("submit", e => {
    e.preventDefault();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value.trim();

    const salary =
      Number(document.getElementById("salary").value);

    const savings =
      Number(document.getElementById("savings").value);

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    if (salary <= 0) {
      alert("Salary must be greater than 0");
      return;
    }

    if (savings < 0) {
      alert("Savings cannot be negative");
      return;
    }

    if (savings >= salary) {
      alert("Savings must be less than salary");
      return;
    }

    const success = registerUser({
      email,
      password,
      salary,
      savingsTarget: savings
    });

    if (!success) {
      alert("Account already exists. Please login.");
      return;
    }

    alert("Account created successfully!");
    location.href = "login.html";
  });
