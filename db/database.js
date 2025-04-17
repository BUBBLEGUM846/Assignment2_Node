"use strict";

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectToDB() {
    await client.connect();
    db = client.db();
}

function getDB() {
    return db;
}