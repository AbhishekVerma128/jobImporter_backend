const exprss = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./dbConnection/connection")
connectDB();
const { connectRedis } = require("./service/redis")
connectRedis()
const routes = require("./routes/jobs.routes")
const port = process.env.PORT || 3001;
const app = exprss();
app.use("/", routes)

app.listen(port, "127.0.0.1", () => {
    console.log(`Server is running on port ${port}`);

})