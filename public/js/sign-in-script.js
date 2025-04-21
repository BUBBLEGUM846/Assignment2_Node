"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const domForm = document.getElementById("user-form");
const domEmail = domForm.elements["email"];
const domPassword = domForm.elements["password"];
const domSubmit = document.getElementById("submit-button");
const domError = document.getElementById("error");

const firebaseCfg = {
    apiKey: "AIzaSyCLpPObnjknqhFCp7sylBAiEkvbuJmRvP4",
    authDomain: "themeparkapp-b896f.firebaseapp.com",
    projectId: "themeparkapp-b896f",
    storageBucket: "themeparkapp-b896f.appspot.com",
    messagingSenderId: "924840648129",
    appId: "1:924840648129:web:e327454c0c1e904b362340"
};

const firebaseApp = initializeApp(firebaseCfg);
const firebaseAuth = getAuth();

domForm.addEventListener("input", () => {
    domSubmit.disabled = !domForm.checkValidity();
});

domForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sign_in();
});

async function sign_in() {
    try {

        const userCredential = await signInWithEmailAndPassword(firebaseAuth, domEmail.value, domPassword.value);
        const token = await userCredential.user.getIdToken();

        const response = await fetch("/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
            credentials: "include"
        });

        if (!response.ok) throw new Error("Server sign-in failed");
        
        window.location.replace("/");

    } catch (error) {
        let errMsg;
        switch (error.code) {
            case "auth/user-not-found":
                errMsg = "No user found with that email.";
                break;
            case "auth/wrong-password":
                errMsg = "Incorrect password.";
                break;
            case "auth/invalid-email":
                errMsg = "Invalid email format.";
                break;
            default:
                errMsg = "Oops! Something went wrong... " + error.code;
                break;
        }
        domError.textContent = errMsg;
        console.error(error);
    }
}