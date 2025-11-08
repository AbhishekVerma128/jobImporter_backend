// worker.js
const { Worker } = require('bullmq');
const JobModel = require('../models/jobs');
const ImportHistory = require('../models/importHistory');
// const REDIS_CONNECTION = require("../service/redis")

async function processBatch(job) {

    const { jobs = [], fileName, status } = job.data;
    let total = 0, created = 0, updated = 0, failed = 0;
    const errors = [];
    if (status === "failed") {
        failed++;
        errors.push({ fileName: fileName, reason: 'missing_id' });
    }

    for (const raw of jobs) {
        total++;
        try {
            const jobLink = raw.jobLink || raw.id;
            if (!jobLink) throw new Error('Missing jobLink');
            const existing = await JobModel.findOne({ jobLink });
            if (existing) {
                updated++
            } else {
                created++;
                const job = new JobModel({
                    _id: raw.id,
                    title: raw.title,
                    feedUrl: fileName,
                    jobLink: raw.jobLink,
                    importedAt: new Date(),
                });
                await job.save();
            }
        } catch (err) {
            failed++;
            errors.push({ fileName, reason: err.message, detail: err.stack });
        }
    }


    // Atomically update ImportHistory
    await ImportHistory.findOneAndUpdate({ fileName }, {
        fileName,
        $inc: { total, new: created, updated, failed },
        $push: { errors: { $each: errors } },
    });

    // return { total, created, updated, failed };
}

module.exports.fetchRedisData = async (req, res, next) => {
    try {
        const REDIS_CONNECTION = {
            url: process.env.REDISURL,
        };

        const worker = new Worker('importQueue', async (job) => {
            // console.log(job.data);
            await processBatch(job);
        }, { connection: REDIS_CONNECTION });

        worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
        worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err.message));
        process.on('SIGINT', async () => {
            await worker.close();
            console.log('Worker stopped');
            process.exit(0);
        });
    } catch (err) {
        console.error('Worker startup failed:', err);
    }
    res.status(200).json({
        status: 'success',
        message: 'Worker started and listening to importQueue'
    });
}