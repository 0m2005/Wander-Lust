require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data.js");

const listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/WANDERlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6abab555c0f0a90854b85e37" }));
    await listing.insertMany(initData.data);
    console.log("data is initialized");
}

initDB();