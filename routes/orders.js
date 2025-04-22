import express from "express";
import { ObjectId } from "mongodb";
import { admin as fb } from "../fb/firebase.js";
import { getDB } from "../db/database.js";
import { allowed } from "../middleware/auth.js";

const router = express.Router();

router.get("/", allowed, (req, res) => {
    res.redirect("/orders/my-orders");
});

router.get("/new", allowed, (req, res) => {
    res.render("new-order");
});

router.post("/new-order", allowed, async (req, res, next) =>
{
    try {
        await getDB().collection("orders").insertOne({
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

router.post("/add-ride", allowed, async (req, res, next) =>
{
    try {
        const ride = await getDB().collection("rides").findOne({ name: req.body.ride });
        await getDB().collection("orders").updateOne(
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

router.post("/buy", allowed, async (req, res, next) =>
{
    try {
        await getDB().collection("orders").updateOne(
            { _id: new ObjectId(req.body.orderId) },
            { $set: { confirmed: true } }
        );
        res.redirect("/orders/my-orders");
    } catch(error) {
        next(error);
    }
});

router.get("/my-orders", allowed, async (req, res, next) => 
{
    try {
        const uid = (await fb.auth().getUser(res.locals.uid)).uid;
        const orders = await getDB().collection("orders").find({ buyer: uid }).toArray();
        const rides = await getDB().collection("rides").find().toArray();
        res.render("my-orders", { orders, rides });
    } catch(error) {
        next(error);
    }
});

export { router as ordersRouter };