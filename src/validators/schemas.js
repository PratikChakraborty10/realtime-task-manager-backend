const { z } = require('zod');

// ============ ENUMS ============

const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    errorMap: () => ({ message: 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
});

const ProjectStatusEnum = z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Status must be one of: ACTIVE, ON_HOLD, COMPLETED, ARCHIVED' })
});

const TaskStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED'], {
    errorMap: () => ({ message: 'Status must be one of: OPEN, IN_PROGRESS, ON_HOLD, CLOSED' })
});

// ============ USER SCHEMAS ============

const signupSchema = z.object({
    name: z.string({
        required_error: 'Name is required'
    }).min(1, 'Name is required').trim(),

    gender: GenderEnum,

    email: z.string({
        required_error: 'Email is required'
    }).email('Invalid email format'),

    password: z.string({
        required_error: 'Password is required'
    }).min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string({
        required_error: 'Email is required'
    }).email('Invalid email format'),

    password: z.string({
        required_error: 'Password is required'
    }).min(1, 'Password is required')
});

const lookupUserSchema = z.object({
    email: z.string({
        required_error: 'Email is required'
    }).email('Invalid email format')
});

// ============ PROJECT SCHEMAS ============

const createProjectSchema = z.object({
    name: z.string({
        required_error: 'Project name is required'
    }).min(1, 'Project name is required').trim(),

    description: z.string().trim().optional()
});

const updateProjectSchema = z.object({
    name: z.string().min(1, 'Project name cannot be empty').trim().optional(),
    description: z.string().trim().optional(),
    status: ProjectStatusEnum.optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required for update'
});

const addMemberSchema = z.object({
    userId: z.string({
        required_error: 'User ID is required'
    }).min(1, 'User ID is required')
});

// ============ TASK SCHEMAS ============

const createTaskSchema = z.object({
    title: z.string({
        required_error: 'Task title is required'
    }).min(1, 'Task title is required').trim(),

    description: z.string().trim().optional(),

    assignee: z.string().optional()
});

const updateTaskSchema = z.object({
    title: z.string().min(1, 'Task title cannot be empty').trim().optional(),
    description: z.string().trim().optional(),
    status: TaskStatusEnum.optional(),
    assignee: z.string().nullable().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required for update'
});

// ============ COMMENT SCHEMAS ============

const commentSchema = z.object({
    content: z.string({
        required_error: 'Comment content is required'
    }).min(1, 'Comment content is required').trim()
});

// ============ SEARCH SCHEMAS ============

const searchSchema = z.object({
    q: z.string({
        required_error: 'Search query is required'
    }).min(1, 'Search query cannot be empty').trim(),

    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
});

const getProjectsSchema = z.object({
    status: ProjectStatusEnum.optional(),

    sortBy: z.enum(['createdAt', 'updatedAt']).optional(),

    sortOrder: z.enum(['asc', 'desc']).optional(),

    cursor: z.string().optional(),

    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
});

module.exports = {
    // Enums
    GenderEnum,
    ProjectStatusEnum,
    TaskStatusEnum,
    // User
    signupSchema,
    loginSchema,
    lookupUserSchema,
    // Project
    createProjectSchema,
    updateProjectSchema,
    addMemberSchema,
    getProjectsSchema,
    // Task
    createTaskSchema,
    updateTaskSchema,
    // Comment
    commentSchema,
    // Search
    searchSchema
};

