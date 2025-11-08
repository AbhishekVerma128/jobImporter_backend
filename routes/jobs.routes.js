const express = require("express");
const router = express.Router();
const producerController = require("../controller/producer")
const workerController = require("../controller/worker")
const jobController = require("../controller/jobs")

router.get("/fetch-from-links", producerController.runAll)
router.get("/fetch-from-redis", workerController.fetchRedisData)
router.get("/job-history", jobController.getJobsData)
module.exports = router;