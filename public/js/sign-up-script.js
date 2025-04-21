"use strict";

import e from "express";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

domForm.addEventListener("change", () => {
    domSubmit.disabled = !domForm.checkValidity();
});

domForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sign_up();
});

async function sign_up() {
    try {

        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, domEmail.value, domPassword.value);
        const token = await userCredential.user.getIdToken(true);

        const response = await fetch("/users/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token })
        });

        if (!response.ok) throw new Error("Failed to sign in on server");

        window.location.replace("users/welcome");
    } catch (error) {
        let errMsg;
        switch (error.code) {
            case "auth/email-already-in-use":
                errMsg = "This email is already registered.";
                break;
            case "auth/invalid-email":
                errMsg = "Please enter a valid email.";
                break;
            case "auth/weak-password":
                errMsg = "Password should be at least 6 characters.";
                break;
            default:
                errMsg = "Oops! Something weny wrong... " + error.code;
                break;
        }
        domError.textContent = errMsg;
    }
}