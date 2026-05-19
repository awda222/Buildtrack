# Security Specification for BuildTrack

## Data Invariants
1. A project must belong to a builder.
2. Only authorized users (builders/supervisors) can modify project materials and tasks.
3. Attendance must be recorded with a valid worker ID and date.
4. Workers can only see their own attendance (if implemented) but typically builders/supervisors manage it.
5. Announcements can be read by everyone in the project.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. User tries to create a project with another person as builderId.
2. User tries to update a material's stock in a project they don't own/supervise.
3. User tries to delete an expense record without being an admin/builder.
4. User tries to spoof attendance date.
5. User tries to inject a huge string into the task description (Resource Poisoning).
6. User tries to set their role to 'builder' when they are a 'worker' in user profile creation.
7. User tries to read private expense logs of another project.
8. User tries to update an immutable `createdAt` field.
9. User tries to bypass stock consumption logic by negative stock updates (though logic is client-side, rules should block weird data).
10. User tries to create a task with no `status`.
11. User tries to read all users' PII (emails).
12. User tries to post an announcement as someone else.

## Red Team Audit Strategy
- Verify `isBuilder()` or `isSupervisor()` check on all writes in project subcollections.
- Verify `isValidId()` for all document IDs.
- Verify `isValid[Entity]()` for schema validation.
- Verify `affectedKeys().hasOnly()` for split updates.
- Verify timestamp validation using `request.time`.
