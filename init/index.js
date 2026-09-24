const mongoose = require("mongoose");
const initData = require("./data.js");

const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WANDERlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
    .then(()=>{
    console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6a9d9a3d6e995b4d39b80f2e"}));
    await listing.insertMany(initData.data);
    console.log("data is initialized");
}

initDB();