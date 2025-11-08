require("dotenv").config();
const { createClient } = require("redis");
const { Queue } = require("bullmq");

const client = createClient({
  url: process.env.REDISURL, 
});
client.on("error", (err) => console.error("❌ Redis Client Error:", err));

const REDIS_CONNECTION = {
  connection: {
    url: process.env.REDISURL,
  },
};

const importQueue = new Queue("importQueue", REDIS_CONNECTION);

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Redis connected successfully");
  }
  return client;
};

const closeRedis = async () => {
  if (client.isOpen) {
    await client.quit();
    console.log("👋 Redis client disconnected");
  }
  await importQueue.close();
};
const subscribeToQueue = async (objData) => {
  await connectRedis();
  await importQueue.add("import-batch", objData, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
  console.log("✅ Job added to importQueue");
};

module.exports = {
  connectRedis,
  REDIS_CONNECTION,
  subscribeToQueue,
  closeRedis,
  importQueue, // optional — if you want to access the Queue instance elsewhere
};
