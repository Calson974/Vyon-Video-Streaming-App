// @ts-nocheck

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBEek_kwT2Fgeg-zhyrqm2z1Q6XmVHv2Tk",
  authDomain: "vyon-streaming-app-project-id.firebaseapp.com",
  projectId: "vyon-streaming-app-project-id",
  databaseURL: "https://vyon-streaming-app-project-id-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "vyon-streaming-app-project-id.firebasestorage.app", // fix later
  messagingSenderId: "410488876628",
  appId: "1:410488876628:web:e8cbccfa9c0ef9a43a07c1",
  measurementId: "G-QYNQ894NWR" 
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

