const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb://localhost:27017/job-import").then(() => {
        console.log("connected to MongoDb");
    }).catch((e) => {
        console.log("error in connect to db: " + e);

    })
}
module.exports = connectDB;