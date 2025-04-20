"use strict";

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db();
        console.log("Connected")
    } catch (error) {
        console.error("Error connecting: ", error);
    }
}

function getDB() {
    return db;
}

export { connectToDB, getDB };