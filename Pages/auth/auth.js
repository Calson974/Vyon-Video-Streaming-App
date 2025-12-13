//@ts-nocheck
import { auth, db } from "../../firebase/firebase-config";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { showModal } from "./modal";
import { get, ref, set, update } from "firebase/database";
import { redirectIfAuthenticated } from '../../firebase/auth-guard';

// Handle URL parameters for auto-selecting login/signup tab
const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');

// Auto-select tab based on URL parameter
if (action === 'signup') {
  setTimeout(() => {
    document.getElementById('signupTab').click();
  }, 100);
} else if (action === 'login') {
  setTimeout(() => {
    document.getElementById('loginTab').click();
  }, 100);
}

// Utility function to redirect authenticated users away from auth page
redirectIfAuthenticated();

const getUsers = async () => {
  // const users = localStorage.getItem("users");
  // return users ? JSON.parse(users) : [];

  const snapshot = await get(ref(db, "users"));
  return snapshot.exists() ? snapshot.val() : {};

};

const saveUser = async (user) => {
  // const users = getUsers();
  // users.push(user);
  // localStorage.setItem("users", JSON.stringify(users));

  await set(ref(db, "users/" + user.uid), user);
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
    return showModal("Oops!", "Please fill in all fields.");
  }

  // Show loading
  showModal("Creating Account...", "Please wait while we set things up.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: name,
    });

    await set(ref(db, "users/" + userCredential.user.uid), {
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: Date.now(),
    });

    showModal(
      "Signup Successful",
      "Your account has been created! Redirecting...",
      () => (window.location.href = "/index.html")
    );

  } catch (error) {
    let msg = "Something went wrong.";

    switch (error.code) {
      case "auth/email-already-in-use":
        msg = "This email is already registered.";
        break;
      case "auth/weak-password":
        msg = "Password must be at least 6 characters.";
        break;
      case "auth/network-request-failed":
        msg = "Network error. Please check your connection.";
        break;
      default:
        msg = error.message;
    }

    showModal("Signup Failed", msg);
  }
});



// ----- LOGIN LOGIC -----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type=email]").value.trim();
  const password = loginForm.querySelector("input[type=password]").value.trim();

  if (!email || !password) {
    return showModal("Oops!", "Please fill in all fields.");
  }

  // Show loading modal
  showModal("Signing In...", "Verifying your credentials...");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    await update(ref(db, "users/" + userCredential.user.uid), {
      lastLogin: Date.now(),
    });

    showModal(
      "Welcome Back!",
      `Hi ${userCredential.user.displayName}! Redirecting...`,
      () => (window.location.href = "/index.html")
    );

  } catch (err) {
    let msg = "Login failed.";

    switch (err.code) {
      case "auth/user-not-found":
        msg = "No account found with this email.";
        break;
      case "auth/wrong-password":
        msg = "Incorrect password.";
        break;
      case "auth/network-request-failed":
        msg = "Network error. Check your internet connection.";
        break;
      default:
        msg = err.message;
    }

    showModal("Login Error", msg);
  }
});



// -- Fetching the current user to display logic ---
export const getCurrentUser = (callback) => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);

    const snap = await get(ref(db, "users/" + user.uid));
    callback(snap.exists() ? snap.val() : null);
  });
}


// ----- LOGOUT LOGIC -----
export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem("currentUser");
  window.location.href = "Pages/auth/auth.html";
}

