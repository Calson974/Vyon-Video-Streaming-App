//@ts-nocheck
import { auth, db } from "../../firebase/firebase-config";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { showModal } from "./modal";
import { get, ref, set, update } from "firebase/database";

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
    showModal("Oops!", "Please fill in all fields.");
    return;
  }

  const users = await getUsers();
  const existingUser = Object.values(users).find(u => u.email === email);


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

      // Save users in real time database
      await set(ref(db, "users/" + userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      createdAt: Date.now()
    });

      // Save new user in local storage
      saveUser({ name, email });

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

    // Update user in Realtime DB
    await update(ref(db, "users/" + userCredential.user.uid), {
      lastLogin: Date.now()
    });
    
    showModal("Welcome Back", `Hi ${user.displayName}! Redirecting to homepage...`, () => {
    window.location.href = "/index.html"; // <-- your homepage
  });

  } catch (err) {
    showModal(err.message);
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

