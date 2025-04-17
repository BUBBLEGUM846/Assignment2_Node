"use strict";

import express from "express";
import { getDB } from "../db/database.js";
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

router.get("/", async (req, res, next) =>
{
    try {
        const rides = await getDB().collection("rides").find().toArray();
        res.render("home", { rides });
    } catch(error) {
        next(error);
    }
});

export { router as usersRouter };