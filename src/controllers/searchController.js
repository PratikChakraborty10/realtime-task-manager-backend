const searchService = require('../services/searchService');

const search = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        const results = await searchService.globalSearch(q, req.user._id, parseInt(limit));

        const totalCount =
            results.projects.length +
            results.tasks.length +
            results.comments.length;

        return res.status(200).json({
            success: true,
            query: q,
            results,
            totalCount
        });
    } catch (error) {
        // Handle case where text index doesn't exist yet
        if (error.code === 27) {
            return res.status(500).json({
                success: false,
                message: 'Search index not ready. Please try again in a moment.'
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    search
};
