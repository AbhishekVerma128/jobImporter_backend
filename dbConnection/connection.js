const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://vermaabhishek128:0155Mee002@cluster0.1exqwcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
        console.log("connected to MongoDb");
    }).catch((e) => {
        console.log("error in connect to db: " + e);

    })
}
module.exports = connectDB;