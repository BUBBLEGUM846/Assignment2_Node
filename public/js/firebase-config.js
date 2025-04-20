import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCLpPObnjknqhFCp7sylBAiEkvbuJmRvP4",
    authDomain: "themeparkapp-b896f.firebaseapp.com",
    projectId: "themeparkapp-b896f",
    storageBucket: "themeparkapp-b896f.appspot.com",  // typo fixed from `.app` to `.app**spot**.com`
    messagingSenderId: "924840648129",
    appId: "1:924840648129:web:e327454c0c1e904b362340"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Expose auth to global scope so your main script can access it
window.auth = auth;