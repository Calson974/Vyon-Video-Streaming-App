const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.addEventListener("click", () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("animate-slideInRight");

  loginTab.classList.add("border-b-2", "border-electric-mint", "text-white");
  signupTab.classList.remove("border-electric-mint", "text-white");
  signupTab.classList.add("text-cool-grey");
});

signupTab.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  signupForm.classList.add("animate-slideInLeft");

  signupTab.classList.add("border-b-2", "border-electric-mint", "text-white");
  loginTab.classList.remove("border-electric-mint", "text-white");
  loginTab.classList.add("text-cool-grey");
});