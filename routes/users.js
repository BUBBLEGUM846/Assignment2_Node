"use strict";

import express from "express";
import { getDB } from "../db/database.js";
import { admin } from "../fb/firebase.js";
import * as auth from "../middleware/auth.js";

const router = express.Router();

router.get("/sign-in", (req, res) =>
{
    res.render("sign-in");
});

router.post("/sign-in", auth.createSessionCookie, (req, res) =>
{
    res.status(200).end();
});

router.get("/sign-up", (req, res) =>
{
    res.render("sign-up");
});

router.post("/sign-up", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        await getDB().collection("users").insertOne({
            uid: userRecord.uid,
            email: userRecord.email,
            createdOn: new Date()
        });

        res.redirect("/sign-in");      
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error registering user");
    }
})

router.get("/", async (req, res, next) =>
{
    try {
        const rides = await getDB().collection("rides").find().toArray();
        const user = res.locals.uid || null;
        res.render("home", { rides, user });
    } catch(error) {
        next(error);
    }
});


router.get("logout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/")
})

export { router as usersRouter };