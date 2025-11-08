// controllers/runAll.js
const Parser = require('rss-parser');
const mongoose = require('mongoose');
const { subscribeToQueue, closeRedis } = require('../service/redis');
const JobHistory = require('../models/importHistory');

module.exports.runAll = async (req, res, next) => {
    const parser = new Parser();

    const FEEDS = [
        'https://jobicy.com/?feed=job_feed',
        'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
        'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
        'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
        'https://jobicy.com/?feed=job_feed&job_categories=data-science',
        'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
        'https://jobicy.com/?feed=job_feed&job_categories=business',
        'https://jobicy.com/?feed=job_feed&job_categories=management',
    ];

    async function enqueueFeed(feedUrl) {
        try {
            const parsed = await parser.parseURL(feedUrl);
            const items = (parsed.items || []).map((i) => ({
                id: new mongoose.Types.ObjectId(),
                jobLink: i.guid || i.id || i.link || i['job-id'] || i.title,
                title: i.title?.trim() || 'Untitled',
                pubDate: i.pubDate ? new Date(i.pubDate) : null,
            }));

            await subscribeToQueue({ fileName: feedUrl, jobs: items, status: 'success' });

            // Update import history to mark as queued
            await JobHistory.findByIdAndUpdate(importDoc._id, {
                $set: { status: 'queued', jobCount: items.length },
            });

            console.log(`✅ Queued ${items.length} jobs from ${feedUrl}`);
        } catch (err) {
            console.error(`❌ Failed to process feed ${feedUrl}:`, err.message);

            await subscribeToQueue({ fileName: feedUrl, jobs: [], status: 'failed' });

            await JobHistory.create({
                _id: new mongoose.Types.ObjectId(),
                fileName: feedUrl,
                importDateTime: new Date(),
                status: 'failed',
                error: err.message,
            });
        }
    }
    await Promise.allSettled(FEEDS.map((url) => enqueueFeed(url)));
    closeRedis();
    res.status(200).json({
        status: 'success',
        message: 'Jobs have been added to the queue successfully.',
    });
};
