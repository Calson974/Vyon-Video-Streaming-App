import { auth } from './firebase-config.js';    
import { onAuthStateChanged } from 'firebase/auth';


// Protect a page to be accessible only by authenticated users like CREATE, MANAGE, UPLOAD etc..
export function protectPage() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/login.html';
        }
    })
}

// Redirect authenticated users away from auth pages like LOGIN, SIGNUP etc..
export function redirectIfAuthenticated() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = '/index.html';
        }
    }) 
}