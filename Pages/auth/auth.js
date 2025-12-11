const getUsers = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
};

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.addEventListener("click", () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("animate-slideInRight");

  loginTab.classList.add("border-b-2", "border-pink-500", "text-white");
  signupTab.classList.remove("border-pink-500", "text-white");
  signupTab.classList.add("text-gray-300");
});

signupTab.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  signupForm.classList.add("animate-slideInLeft");

  signupTab.classList.add("border-b-2", "border-pink-500", "text-white");
  loginTab.classList.remove("border-pink-500", "text-white");
  loginTab.classList.add("text-gray-300");
});

// ----- MODAL UTILS -----
const modal = document.getElementById("modalPopup");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");

const showModal = (title, message, callback) => {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove("hidden");

  const handler = () => {
    modal.classList.add("hidden");
    modalClose.removeEventListener("click", handler);
    if (callback) callback();
  };

  modalClose.addEventListener("click", handler);
};

// ----- SIGNUP LOGIC -----
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = signupForm.querySelector("input[type=text]").value.trim();
  const email = signupForm.querySelector("input[type=email]").value.trim();
  const password = signupForm.querySelector("input[type=password]").value.trim();

  if (!name || !email || !password) {
    showModal("Oops!", "Please fill in all fields.");
    return;
  }

  const users = getUsers();
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    showModal("Email Exists", "This email is already registered. Please log in instead.", () => {
      loginTab.click();
      loginForm.querySelector("input[type=email]").value = email;
    });
    return;
  }

  // Save new user
  saveUser({ name, email, password });
  showModal("Signup Successful", "Your account has been created! Redirecting to homepage...", () => {
    window.location.href = "/index.html"; // <-- your homepage
  });
});

// ----- LOGIN LOGIC -----
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type=email]").value.trim();
  const password = loginForm.querySelector("input[type=password]").value.trim();

  if (!email || !password) {
    showModal("Oops!", "Please fill in all fields.");
    return;
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    showModal("Login Failed", "Invalid email or password!");
    return;
  }

  showModal("Welcome Back", `Hi ${user.name}! Redirecting to homepage...`, () => {
    window.location.href = "/index.html"; // <-- your homepage
  });
});
