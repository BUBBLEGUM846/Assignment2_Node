"use strict";

import express from "express";
import cookieParser from "cookie-parser";
import { connectToDB } from "./db/database.js";
import { usersRouter } from "./routes/users.js";
import { ordersRouter } from "./routes/orders.js";
import * as auth from "./middleware/auth.js";

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(auth.allowed);

app.use((req, res, next) => {
    res.locals.users = res.locals.uid || null;
    next();
});

app.use("/", usersRouter);
app.use("/orders", ordersRouter);

connectToDB().then(() =>
{
    app.listen(PORT, () =>
    {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((err) =>
{
    console.error("Failed to connect to DB", err);
});