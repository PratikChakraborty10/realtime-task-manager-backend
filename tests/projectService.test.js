const projectService = require('../src/services/projectService');
const Project = require('../src/models/Project');
const User = require('../src/models/User');

// Mock models
jest.mock('../src/models/Project');
jest.mock('../src/models/User');

describe('Project Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a project successfully', async () => {
            const projectData = {
                name: 'New Project',
                description: 'Test Description',
                createdBy: 'user123'
            };

            const mockCreatedProject = {
                ...projectData,
                _id: 'project123',
                members: ['user123']
            };

            Project.create.mockResolvedValue(mockCreatedProject);

            const result = await projectService.createProject(projectData);

            expect(result).toEqual(mockCreatedProject);
            expect(Project.create).toHaveBeenCalledWith({
                ...projectData,
                members: ['user123']
            });
        });
    });

    describe('addMember', () => {
        it('should add a member to the project', async () => {
            const projectId = 'project123';
            const userId = 'user456';

            const mockProject = {
                _id: projectId,
                members: ['user123', userId]
            };

            // Mock the chain: findByIdAndUpdate(...).populate(...)
            const mockChain = {
                populate: jest.fn().mockResolvedValue(mockProject)
            };
            Project.findByIdAndUpdate.mockReturnValue(mockChain);

            const result = await projectService.addMember(projectId, userId);

            expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
                projectId,
                { $addToSet: { members: userId } },
                { new: true }
            );
            expect(result).toEqual(mockProject);
        });
    });

    describe('isProjectMember', () => {
        it('should return true if user is creator', async () => {
            const projectId = 'project123';
            const userId = 'user123';

            const mockProject = {
                _id: projectId,
                createdBy: { equals: jest.fn().mockReturnValue(true) },
                members: []
            };

            Project.findById.mockResolvedValue(mockProject);

            const result = await projectService.isProjectMember(projectId, userId);

            expect(result).toBe(true);
        });

        it('should return true if user is in members', async () => {
            const projectId = 'project123';
            const userId = 'user456';

            const mockProject = {
                _id: projectId,
                createdBy: { equals: jest.fn().mockReturnValue(false) },
                members: [{ equals: jest.fn().mockReturnValue(true) }]
            };

            Project.findById.mockResolvedValue(mockProject);

            const result = await projectService.isProjectMember(projectId, userId);

            expect(result).toBe(true);
        });

        it('should return false if user is not associated', async () => {
            const projectId = 'project123';
            const userId = 'user789';

            const mockProject = {
                _id: projectId,
                createdBy: { equals: jest.fn().mockReturnValue(false) },
                members: [{ equals: jest.fn().mockReturnValue(false) }]
            };

            Project.findById.mockResolvedValue(mockProject);

            const result = await projectService.isProjectMember(projectId, userId);

            expect(result).toBe(false);
        });
    });
});
