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
        const order = await getDB().collection("orders").findOne({
            _id: new ObjectId(req.body.orderId),
            buyer: res.locals.uid
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ticketDate = new Date(order.date);
        ticketDate.setHours(0, 0, 0, 0);

        if (ticketDate <= today) {
            return res.redirect("/orders/my-orders");
        }

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
        
        setTimeout(() => {
            res.redirect("/");
        }, 2000);

    } catch(error) {
        next(error);
    }
});

router.get("/my-orders", allowed, async (req, res, next) => 
{
    try {
        const uid = res.locals.uid;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const orders = await getDB().collection("orders").find({ 
            buyer: uid,
            date: { $gte: now },
            used: { $ne: true } 
    }).toArray();

        const rides = await getDB().collection("rides").find().toArray();

        res.render("my-orders", { orders, rides });
    } catch(error) {
        next(error);
    }
});

router.get("/confirm/:id", allowed, async (req, res, next) => {
    try {
        const order = await getDB().collection("orders").findOne({
            _id: new ObjectId(req.params.id),
            buyer: res.locals.uid
        });

        if (!order) return res.status(404).send("Order not found");

        res.render("confirm-order", { order });
    } catch (error) {
        next(error);
    }
});

router.get("/history", allowed, async (req, res, next) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const pastOrders = await getDB().collection("orders").find({
            buyer: res.locals.uid,
        }).toArray();

        const rides = await getDB().collection("rides").find().toArray();

        res.render("order-history", { orders: pastOrders, rides });
    } catch (error) {
        next(error);
    }
});

router.post("/use", allowed, async (req, res, next) => {
    try {
        const orderId = req.body.orderId;

        const result = await getDB().collection("orders").updateOne(
            { _id: new ObjectId(orderId), buyer: res.locals.uid },
            { $set: { used: true } }
        );

        if (result.modifiedCount === 0) {

            return res.status(404).send("Order not found")
        }

        res.redirect("/orders/my-orders");
    } catch (error) {
        next(error);
    }
});

export { router as ordersRouter };