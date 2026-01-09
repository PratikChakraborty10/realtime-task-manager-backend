# Real-Time Task Manager Backend

A production-ready Node.js/Express backend for a collaborative task management application with **real-time updates**, **cursor-based pagination**, and **soft delete** capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Supabase project (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/PratikChakraborty10/realtime-task-manager-backend.git
cd realtime-task-manager-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your .env file (see Environment Variables below)
# Start development server
npm run dev
```

### Environment Variables

```env
# Server
PORT=8000

# MongoDB
DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/task_manager_api

# Supabase (Get from Dashboard → Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React/Next.js)                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │ HTTP REST API                Socket.IO        │
        │ (CRUD Operations)          (Real-time Events) │
        └───────────────────────┬───────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                          Express.js Server                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   Routes    │──│ Controllers │──│  Services   │──│    Models    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘  │
│         │                                                  │          │
│  ┌──────▼──────┐                                  ┌────────▼───────┐  │
│  │ Middleware  │                                  │    MongoDB     │  │
│  │ (Auth, Val) │                                  │   (Mongoose)   │  │
│  └─────────────┘                                  └────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     Socket.IO (Event Emitter)                   │  │
│  │   Rooms: project:{id}, task:{id}                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Supabase Auth       │
                    │  (JWT Verification)   │
                    └───────────────────────┘
```

### Project Structure

```
src/
├── config/          # Database & Supabase connections
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, project authorization
├── models/          # Mongoose schemas (User, Project, Task, Comment)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── socket/          # Socket.IO event emitters
└── validators/      # Zod validation schemas
```

### Layer Responsibilities

| Layer | Purpose |
|-------|---------|
| **Routes** | Define endpoints, apply middleware chain |
| **Middleware** | Auth (Supabase JWT), validation (Zod), authorization |
| **Controllers** | Handle HTTP req/res, call services, emit socket events |
| **Services** | Business logic, database operations |
| **Models** | Mongoose schemas with soft delete middleware |

### Service Interactions

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Controller Layer                                 │
│                                                                               │
│  projectController ──────────────────────────────────────────────────────┐   │
│        │                                                                 │   │
│        ├── calls ──► projectService.createProject()                      │   │
│        ├── calls ──► projectService.getProjectsByUser()                  │   │
│        ├── calls ──► userService.getUserById() ◄── validates member      │   │
│        └── emits ──► emitProjectUpdated() ──► Socket.IO                  │   │
│                                                                               │
│  taskController ─────────────────────────────────────────────────────────┐   │
│        │                                                                 │   │
│        ├── calls ──► taskService.createTask()                            │   │
│        ├── calls ──► projectService.isProjectMember() ◄── authorization  │   │
│        └── emits ──► emitTaskCreated() ──► Socket.IO                     │   │
│                                                                               │
│  searchController ───────────────────────────────────────────────────────┐   │
│        │                                                                 │   │
│        ├── calls ──► projectService.getProjectsByUser() ◄── scope       │   │
│        ├── queries ► Project.find({ $text })                             │   │
│        ├── queries ► Task.find({ $text, project: { $in: userProjects }}) │   │
│        └── queries ► Comment.find({ $text })                             │   │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Service Layer                                    │
│                                                                               │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐             │
│  │  userService    │   │ projectService  │   │   taskService   │             │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤             │
│  │ createUser()    │   │ createProject() │   │ createTask()    │             │
│  │ getUserById()   │   │ getProjectById()│   │ getTaskById()   │             │
│  │ getUserByEmail()│◄──│ addMember()     │──►│ getTasksByProj()│             │
│  └────────┬────────┘   │ isProjectMember │   └────────┬────────┘             │
│           │            │ isProjectOwner  │            │                      │
│           │            └────────┬────────┘            │                      │
│           │                     │                     │                      │
│           └──────────┬──────────┴──────────┬──────────┘                      │
│                      │                     │                                  │
│                      ▼                     ▼                                  │
│              ┌─────────────────────────────────────────┐                     │
│              │          commentService                 │                     │
│              ├─────────────────────────────────────────┤                     │
│              │ createComment() ◄── linked to Task      │                     │
│              │ deleteComment() ◄── soft deletes        │                     │
│              └─────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Model Layer (Mongoose)                           │
│                                                                               │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐             │
│  │  User   │◄────►│ Project │◄────►│  Task   │◄────►│ Comment │             │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘             │
│       │                │                │                │                   │
│       └────────────────┴────────────────┴────────────────┘                   │
│                                │                                              │
│                    ┌───────────▼───────────┐                                 │
│                    │   Soft Delete Hook    │                                 │
│                    │ pre(/^find/) ──► where({ deletedAt: null })             │
│                    └───────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Creating a Task

```
1. POST /projects/:projectId/tasks
       │
       ▼
2. Route ──► authenticate ──► requireMember ──► validate ──► taskController
       │
       ▼
3. taskController.createTask()
       │
       ├── projectService.isProjectMember(projectId, userId)  ✓
       │
       ├── taskService.createTask({ title, project, createdBy })
       │       │
       │       └── Task.create() ──► MongoDB
       │
       └── emitTaskCreated(projectId, task)
               │
               └── io.to(`project:${projectId}`).emit('task:created', { task })
                       │
                       └── All connected clients in room receive update
```

---

## ⚡ Real-Time Updates

The app uses **Socket.IO** to broadcast changes instantly to all connected clients viewing the same project.

### How It Works

1. Client connects to Socket.IO and joins a project room: `project:{projectId}`
2. When a user creates/updates/deletes a task, the controller calls the emitter
3. The emitter broadcasts to all clients in the project room
4. Clients update their UI without refreshing

### Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `task:created` | New task added | `{ task }` |
| `task:updated` | Task modified | `{ task }` |
| `task:deleted` | Task removed | `{ taskId }` |
| `project:updated` | Project details changed | `{ project }` |
| `member:added` | New project member | `{ project, member }` |
| `member:removed` | Member removed | `{ project, memberId }` |
| `comment:created` | New comment | `{ comment }` |

---

## 📄 Cursor-Based Pagination

### Why Cursor Instead of Offset?

| Offset Pagination | Cursor Pagination |
|-------------------|-------------------|
| `?page=5&limit=20` | `?cursor=abc123&limit=20` |
| ❌ Slow on large datasets (MongoDB skips N docs) | ✅ Fast (uses indexed `_id`) |
| ❌ Duplicates/missing items if data changes | ✅ Consistent results |
| ❌ "Page 500" requires scanning 10,000 docs | ✅ Direct jump to cursor position |

**For real-time apps where data changes frequently, cursor pagination is essential.**

### API Response Format

```json
{
  "success": true,
  "tasks": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "507f1f77bcf86cd799439011"
  }
}
```

### Usage

1. **First request**: `GET /projects/{id}/tasks?limit=20`
2. **Next page**: `GET /projects/{id}/tasks?limit=20&cursor={nextCursor}`
3. **Stop when**: `hasMore: false`

---

## 🗑️ Soft Delete

Records are never permanently deleted. Instead, a `deletedAt` timestamp is set.

### How It Works

```javascript
// Mongoose pre-find middleware (applied automatically)
schema.pre(/^find/, function () {
    this.where({ deletedAt: null });
});
```

All `find` queries automatically exclude soft-deleted records.

### Benefits

- **Data Recovery**: Accidentally deleted items can be restored
- **Auditing**: Complete history preserved
- **Referential Integrity**: No orphaned references

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. Frontend authenticates with Supabase → receives JWT
2. Frontend sends JWT in `Authorization: Bearer <token>` header
3. Backend verifies JWT with Supabase → extracts user ID
4. Backend loads user from MongoDB → attaches to `req.user`

### Authorization Roles

| Role | Project Permissions |
|------|---------------------|
| **ADMIN** | All actions on any project |
| **Project Owner** (Manager) | Update details, add/remove members, delete project |
| **Member** | View project, create tasks, update status |

---

## 🧪 Testing

```bash
# Run unit tests
npm test
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/signup` | Create account |
| `POST` | `/api/v1/login` | Login |
| `GET` | `/api/v1/projects` | List user's projects |
| `POST` | `/api/v1/projects` | Create project (Admin) |
| `PATCH` | `/api/v1/projects/:id` | Update project |
| `DELETE` | `/api/v1/projects/:id` | Delete project (Owner) |
| `GET` | `/api/v1/projects/:id/tasks` | List tasks |
| `POST` | `/api/v1/projects/:id/tasks` | Create task |
| `PATCH` | `/api/v1/projects/:id/tasks/:taskId` | Update task |
| `DELETE` | `/api/v1/projects/:id/tasks/:taskId` | Delete task |
| `GET` | `/api/v1/search` | Global search |

---

## 🔍 Global Search API

The search API allows users to find **projects**, **tasks**, and **comments** across all their accessible content.

### Endpoint

```
GET /api/v1/search?q=keyword&limit=10
```

### How It Works

1. Uses **MongoDB Text Indexes** for fast full-text search
2. Searches across:
   - Project names and descriptions
   - Task titles and descriptions
   - Comment content
3. Returns results **scoped to user's projects** (no unauthorized data leakage)

### Response

```json
{
  "success": true,
  "results": {
    "projects": [
      { "_id": "...", "name": "Marketing Campaign", "description": "Q1 planning" }
    ],
    "tasks": [
      { "_id": "...", "title": "Write copy", "project": { "name": "Marketing Campaign" } }
    ],
    "comments": [
      { "_id": "...", "content": "Great work on this!", "task": { "title": "Review design" } }
    ]
  }
}
```

### Text Indexes

Each model has a text index for searchable fields:

```javascript
// Project
projectSchema.index({ name: 'text', description: 'text' });

// Task
taskSchema.index({ title: 'text', description: 'text' });

// Comment
commentSchema.index({ content: 'text' });
```

