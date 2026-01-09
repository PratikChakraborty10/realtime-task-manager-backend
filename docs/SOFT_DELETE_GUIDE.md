# Frontend Guide: Soft Deletes

This guide explains how **Soft Deletes** work in the backend and what the frontend should expect.

---

## 1. What is Soft Delete?

Instead of permanently removing records from the database, we set a `deletedAt` timestamp. Records with a non-null `deletedAt` are considered deleted.

**Why?**
*   **Data Recovery**: Accidentally deleted items can be restored by an admin or through a future "Trash" feature.
*   **Auditing**: Maintain a complete history of actions.
*   **Referential Integrity**: Avoid orphaned references in related data.

---

## 2. Affected Models

| Model | Soft-Deleted Field |
|-------|-------------------|
| Project | `deletedAt: Date` |
| Task | `deletedAt: Date` |
| Comment | `deletedAt: Date` |

---

## 3. Frontend Behavior

**No changes needed!**

The backend automatically filters out soft-deleted records from all `find` operations. The API will:

*   **Not return** deleted projects, tasks, or comments in list endpoints.
*   **Return 404** if you try to access a specific deleted item by ID.

---

## 4. Delete Operations

When you call a DELETE endpoint, the backend will:

1.  Set `deletedAt = new Date()` on the record.
2.  *Cascade (where applicable)*: When a Task is deleted, all its Comments are also soft-deleted.

**Example API Response (unchanged)**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 5. Future: Trash Feature (Optional)

If you want to implement a "Trash" or "Recycle Bin" UI later, the backend can add:

*   `GET /projects/trash`: List deleted projects.
*   `POST /projects/:id/restore`: Restore a deleted project.
*   `DELETE /projects/:id/permanent`: Permanently remove (for admins).

Let us know if you need this feature!

---

## 6. Admin Note

For debugging or direct database access, remember that soft-deleted records are still in the database. To query them directly in MongoDB:

```javascript
db.projects.find({ deletedAt: { $ne: null } })
```
