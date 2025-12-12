import { auth } from "../../firebase/firebase-config";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { showModal } from "./modal";

const getUsers = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
};

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");


// ----- SIGNUP LOGIC -----
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

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

   try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Save new user in local storage
      saveUser({ name, email, password });

      showModal("Signup Successful", "Your account has been created! Redirecting to homepage...", () => {
    window.location.href = "/index.html"; // <-- your homepage
  });

   } catch (error) {
      showModal(`Error: ${error.message}`);
   }
});


// ----- LOGIN LOGIC -----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type=email]").value.trim();
  const password = loginForm.querySelector("input[type=password]").value.trim();

  if (!email || !password) {
    showModal("Oops!", "Please fill in all fields.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;
    
    showModal("Welcome Back", `Hi ${user.displayName}! Redirecting to homepage...`, () => {
    window.location.href = "/index.html"; // <-- your homepage
  });

  } catch (err) {
    showModal(err.message);
  }

});


// ----- LOGOUT LOGIC -----
// export const logout = async () => {
//   await signOut(auth);
//   localStorage.removeItem("currentUser");
//   window.location.href = "Pages/auth/auth.html";
// }

