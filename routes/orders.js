import express from "express";
import { ObjectId } from "mongodb";
import fb from "../fb/firebase.js";
import db from "../db/database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/new-order", auth.allowed, async (req, res, next) =>
{
    try {
        await db.getDB().collection("orders").insertOne({
            buyer: res.locals.uid,
            date: new Date(req.body.date),
            fastRides: [],
            total: 20,
            confirmed: false
        });
        res.redirect("/orders/my-orders");
    } catch(error) {
        next(error);
    }
});

router.post("/add-ride", auth.allowed, async (req, res, next) =>
{
    try {
        const ride = await db.getDB().collection("rides").findOne({ name: req.body.ride });
        await db.getDB().collection("orders").updateOne(
            { _id: new ObjectId(req.body.orderId) },
            {
                $push: { fastRides: ride.name },
                $inc: { total: ride.cost }
            }
        );
        res.redirect("/orders/my-orders");
    } catch(error) {
        next(error);
    }
});

router.post("/buy", auth.allowed, async (req, res, next) =>
{
    try {
        await db.getDB().collection("orders").updateOne(
            { _id: new ObjectId(req.body.orderId) },
            { $set: { confirmed: true } }
        );
        res.redirect("/orders/my-orders");
    } catch(error) {
        next(error);
    }
});

router.get("/my-orders", auth.allowed, async (req, res, next) => 
{
    try {
        const uid = (await fb.auth().getUser(res.locals.uid)).uid;
        const orders = await db.getDB().collection("orders").find({ buyer: uid }).toArray();
        res.render("my-orders", { orders });
    } catch(error) {
        next(error);
    }
});