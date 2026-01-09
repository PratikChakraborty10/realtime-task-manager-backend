const taskService = require('../src/services/taskService');
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const Project = require('../src/models/Project');

// Mock models
jest.mock('../src/models/Task');
jest.mock('../src/models/Comment');
jest.mock('../src/models/Project');

describe('Task Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const taskData = {
                title: 'New Task',
                description: 'Description',
                project: 'project123',
                createdBy: 'user123'
            };

            const mockTask = {
                ...taskData,
                _id: 'task123',
                populate: jest.fn().mockReturnThis() // populate returns the task itself (or promise)
            };

            // Task.create needs to return an object that has populate method
            Task.create.mockResolvedValue(mockTask);

            const result = await taskService.createTask(taskData);

            expect(Task.create).toHaveBeenCalledWith(taskData);
            expect(mockTask.populate).toHaveBeenCalledWith(['assignee', 'createdBy'], 'name email');
            expect(result).toHaveProperty('_id', 'task123');
        });
    });

    describe('updateTask', () => {
        it('should update task fields', async () => {
            const taskId = 'task123';
            const updateData = { status: 'IN_PROGRESS' };

            const mockUpdatedTask = {
                _id: taskId,
                title: 'Old Title',
                ...updateData
            };

            // Better mock for chain
            const mockPopulate2 = {
                ...mockUpdatedTask
            };
            const mockPopulate1 = {
                populate: jest.fn().mockResolvedValue(mockPopulate2)
            };

            Task.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue(mockPopulate1)
            });

            const result = await taskService.updateTask(taskId, updateData);

            expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId,
                updateData,
                { new: true }
            );
            expect(result.status).toBe('IN_PROGRESS');
        });

        it('should return null if task not found', async () => {
            const mockChainNull = {
                populate: jest.fn().mockReturnThis(),
                then: (resolve) => resolve(null)
            };
            Task.findByIdAndUpdate.mockReturnValue(mockChainNull);

            const result = await taskService.updateTask('invalidId', {});

            expect(result).toBeNull();
        });
    });

    describe('getTasksByProject', () => {
        it('should return tasks for a project', async () => {
            const projectId = 'project123';
            const mockTasks = [
                { _id: 'task1', title: 'Task 1', project: projectId },
                { _id: 'task2', title: 'Task 2', project: projectId }
            ];

            // Mock chains
            const mockChain = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockTasks)
            };

            Task.find.mockReturnValue(mockChain);

            const result = await taskService.getTasksByProject(projectId, { limit: 10 });

            expect(Task.find).toHaveBeenCalledWith({ project: projectId });
            expect(result.data).toHaveLength(2);
        });
    });
});
