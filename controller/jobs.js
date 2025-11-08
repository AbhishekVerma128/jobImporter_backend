const JobHistory = require('../models/importHistory');

module.exports.getJobsData = async (req, res, next) => {
    try {
        const jobs = await JobHistory.find().limit(100).sort({ importedAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Server Error' });
    }   
}