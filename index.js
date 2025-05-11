"use strict";

import express from "express";
import cookieParser from "cookie-parser";
import { connectToDB } from "./db/database.js";
import { usersRouter } from "./routes/users.js";
import { ordersRouter } from "./routes/orders.js";
import { admin as fb } from "./fb/firebase.js";

const app = express();
const PORT = 8080;

//middleware configs for cookies and other stuff i may or may not have used
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//connect to auth.js for cookie - accidentally duplicated this and had to delete
app.use(allowed);

app.use("/", usersRouter);
app.use("/orders", ordersRouter);

//connect to database first, when successful, start server
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