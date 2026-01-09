const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

/**
 * Global search across projects, tasks, and comments
 * Uses MongoDB text indexes for efficient full-text search
 */
const globalSearch = async (query, userId, limit = 10) => {
    const searchQuery = { $text: { $search: query } };
    const textScore = { score: { $meta: 'textScore' } };

    // Get projects user has access to
    const userProjects = await Project.find({
        $or: [
            { createdBy: userId },
            { members: userId }
        ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Run 3 parallel searches
    const [projects, tasks, comments] = await Promise.all([
        // Search projects user has access to
        Project.find({
            ...searchQuery,
            _id: { $in: projectIds }
        })
            .select({ ...textScore, name: 1, description: 1, status: 1 })
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .lean(),

        // Search tasks in user's projects
        Task.find({
            ...searchQuery,
            project: { $in: projectIds }
        })
            .select({ ...textScore, title: 1, description: 1, status: 1, project: 1 })
            .populate('project', 'name')
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .lean(),

        // Search comments in user's projects' tasks
        Comment.find(searchQuery)
            .select({ ...textScore, content: 1, task: 1, createdAt: 1 })
            .populate({
                path: 'task',
                select: 'title project',
                populate: {
                    path: 'project',
                    select: 'name'
                }
            })
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .lean()
    ]);

    // Filter comments to only include those in user's projects
    const filteredComments = comments.filter(c =>
        c.task && c.task.project && projectIds.some(id => id.equals(c.task.project._id))
    );

    return {
        projects: projects.map(p => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            status: p.status,
            matchedOn: 'project'
        })),
        tasks: tasks.map(t => ({
            _id: t._id,
            title: t.title,
            description: t.description,
            status: t.status,
            project: t.project,
            matchedOn: 'task'
        })),
        comments: filteredComments.map(c => ({
            _id: c._id,
            content: c.content,
            task: c.task ? { _id: c.task._id, title: c.task.title } : null,
            project: c.task?.project || null,
            createdAt: c.createdAt,
            matchedOn: 'comment'
        }))
    };
};

module.exports = {
    globalSearch
};
