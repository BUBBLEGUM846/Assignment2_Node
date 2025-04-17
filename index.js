"use strict";

import express from "express";
import cookieParser from "cookie-parser";
import { getDB } from "./db/database.js";
import { usersRouter } from "./routes/users.js";
import { ordersRouter } from "./routes/orders.js";

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

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