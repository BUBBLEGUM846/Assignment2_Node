import express from "express";
import { ObjectId } from "mongodb";
import { admin as fb } from "../fb/firebase.js";
import { getDB } from "../db/database.js";
import { allowed } from "../middleware/auth.js";

const router = express.Router();

//route redirects to my-orders - I havent used this consistently and cba to changw everything
//allowed is only for authenticated users
router.get("/", allowed, (req, res) => {
    res.redirect("/orders/my-orders");
});

//create new order
router.get("/new", allowed, (req, res) => {
    res.render("new-order");
});

router.post("/new-order", allowed, async (req, res, next) =>
{
    try {
        //user, date provided, empty fastrides, ticket is £20, confirmed is false (probably dont need confirmed anymore)
        await getDB().collection("orders").insertOne({
            buyer: res.locals.uid,
            date: new Date(req.body.date),
            fastRides: [],
            total: 20,
            confirmed: false
        });
        //redirect back to my orders
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

        const ride = await getDB().collection("rides").findOne({ name: req.body.ride });

        await getDB().collection("orders").updateOne(
            { _id: new ObjectId(req.body.orderId) },
            {
                $push: { fastRides: ride.name }, //add name to fastrides array
                $inc: { total: ride.cost }, //increase the cost based on fasttrack price
                $set: { needsConfirmation: true } //needs to be confirmed
            }
        );
        res.redirect("/orders/my-orders");
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

        //lists orders that are for the future and are not marked as used
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

router.get("/history", allowed, async (req, res, next) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const pastOrders = await getDB().collection("orders").find({
            //filters orders that are past or have been used
            buyer: res.locals.uid,
            $or: [
                { date: { $lt: now }, used: { $ne: true } },
                { used: true }
            ]
        }).toArray();

        const rides = await getDB().collection("rides").find().toArray();

        res.render("order-history", { orders: pastOrders, rides });
    } catch (error) {
        next(error);
    }
});

//new confirm order that needs confirms after every change of the ticket
router.post("/confirm-order", allowed, async (req, res, next) => {
    try {

        const orderId = req.body.orderId;

        const order = await getDB().collection("orders").findOne({
            _id: new ObjectId(orderId),
            buyer: res.locals.uid,
            needsConfirmation: { $exists: true }
        });

        const result = await getDB().collection("orders").updateOne(
            { _id: new ObjectId(orderId), buyer: res.locals.uid },
            { $unset: { needsConfirmation: "" } } //confirm
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Order not found or already confirmed")
        }

        res.redirect("/orders/my-orders");
    } catch (error) {
        next(error);
    }
});

//mark ticket as used
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