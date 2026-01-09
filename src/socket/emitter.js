const { getIO } = require('../config/socket');

// Task events - broadcast to project room
const emitTaskCreated = (projectId, task) => {
    getIO().to(`project:${projectId}`).emit('task:created', { task });
};

const emitTaskUpdated = (projectId, task) => {
    getIO().to(`project:${projectId}`).emit('task:updated', { task });
};

const emitTaskDeleted = (projectId, taskId) => {
    getIO().to(`project:${projectId}`).emit('task:deleted', { taskId });
};

// Comment events - broadcast to task room
const emitCommentCreated = (taskId, comment) => {
    getIO().to(`task:${taskId}`).emit('comment:created', { comment });
};

const emitCommentUpdated = (taskId, comment) => {
    getIO().to(`task:${taskId}`).emit('comment:updated', { comment });
};

const emitCommentDeleted = (taskId, commentId) => {
    getIO().to(`task:${taskId}`).emit('comment:deleted', { commentId });
};

// Project events - broadcast to project room
const emitProjectUpdated = (projectId, project) => {
    getIO().to(`project:${projectId}`).emit('project:updated', { project });
};

const emitProjectMemberAdded = (projectId, project, member) => {
    getIO().to(`project:${projectId}`).emit('member:added', { project, member });
};

const emitProjectMemberRemoved = (projectId, project, memberId) => {
    getIO().to(`project:${projectId}`).emit('member:removed', { project, memberId });
};

module.exports = {
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitCommentCreated,
    emitCommentUpdated,
    emitCommentDeleted,
    emitProjectUpdated,
    emitProjectMemberAdded,
    emitProjectMemberRemoved
};
