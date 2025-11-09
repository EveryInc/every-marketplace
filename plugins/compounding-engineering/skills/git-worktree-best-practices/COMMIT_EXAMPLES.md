# Conventional Commit Message Examples

This document provides 20+ real-world examples of well-formed conventional commit messages for git worktree workflows.

## Feature Development Commits

### Authentication Feature
```
feat(auth): implement login form with validation

- Add email/password input fields
- Include client-side validation
- Add remember me functionality

Co-Authored-By: Claude <noreply@anthropic.com>
```

### API Feature
```
feat(api): add user profile endpoint

Implements GET /api/users/:id endpoint with proper error handling.

- Fetch user from database
- Apply role-based access control
- Return formatted user profile

Refs: #234
Co-Authored-By: Claude <noreply@anthropic.com>
```

### UI Feature
```
feat(ui): add dark mode toggle to settings

Users can now switch between light and dark theme from account settings.
Preference is persisted to local storage.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Bug Fix Commits

### API Fix
```
fix(api): resolve null reference in request handler

The request handler was not checking if user exists before accessing
properties, causing crashes on invalid user IDs.

Added existence check before property access.

Closes #567
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Auth Fix
```
fix(auth): resolve session timeout timing issue

Session tokens were not being refreshed correctly, causing unexpected
logouts after 30 minutes.

Fixed token refresh logic to match configured timeout values.

Refs: #890
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Cache Fix
```
fix(cache): clear cache on data mutation

Cache was persisting after updates, showing stale data to users.

Added cache invalidation on create/update/delete operations.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Performance Improvement Commits

### Database Performance
```
perf(db): optimize user lookup with indexing

User lookup queries were scanning full table (~50ms queries).
Added composite index on (email, status) fields.

Performance improvement: 50ms → 2ms for typical queries.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### API Performance
```
perf(api): implement response caching

Identical requests to /api/config were hitting database each time.
Implemented 5-minute response caching with invalidation on updates.

Reduces database load and improves response time by 60%.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Build Performance
```
perf(build): parallelize test execution

Test suite was taking 5 minutes to run serially.
Configured parallel test execution with 4 workers.

Test time reduced from 5m to 1m 20s.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Documentation Commits

### API Documentation
```
docs(api): add endpoint documentation with examples

Added comprehensive documentation for all user management endpoints
including request/response examples and error cases.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Setup Documentation
```
docs(setup): update development environment setup guide

Added instructions for:
- Installing dependencies
- Configuring environment variables
- Running tests locally
- Starting development server

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Feature Documentation
```
docs(worktree): document feature branch context and goals

Created comprehensive documentation for the authentication feature
including architecture decisions and integration points.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Refactoring Commits

### Code Refactoring
```
refactor(auth): extract authentication logic into service

Moved inline authentication logic from controller into dedicated
AuthenticationService for better testability and reusability.

No behavior changes, all existing tests pass.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Database Refactoring
```
refactor(db): reorganize query builders into modules

Grouped related query builders into logical modules for better
maintainability and discoverability.

All queries migrated, no performance impact.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Test Commits

### Unit Tests
```
test(auth): add unit tests for login validation

Added comprehensive unit tests covering:
- Valid email/password combinations
- Invalid email formats
- Missing fields
- SQL injection attempts

Coverage: +15% → 78%

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Integration Tests
```
test(api): add integration tests for user endpoints

Created integration tests for GET/POST/PUT/DELETE /api/users
including authentication, authorization, and edge cases.

Tests run against real database migrations.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Maintenance / Chore Commits

### Dependency Update
```
chore(deps): update express from 4.17 to 4.18

- Update package.json dependency version
- Run npm audit to verify security
- Update compatibility in code (none needed)

Addresses security vulnerabilities in express middleware.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Build Configuration
```
chore(build): add minification step to production build

Added webpack minification and CSS compression to production build
to reduce bundle size.

Reduces bundle size by 40% for faster page loads.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Repository Setup
```
chore(setup): add .worktrees to .gitignore

Added .worktrees directory to .gitignore to prevent tracking
local worktree directories in version control.

All developers should gitpull to get updated .gitignore.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Work in Progress Commits

### Checkpoint Commit
```
wip(feature): checkpoint progress on auth implementation

Saving work before context switch to urgent bug fix.
This commit will be squashed before merge.

Progress so far:
- Login form UI complete
- Validation logic complete
- Still need: Backend integration, Tests

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Breaking Change Commits

### Breaking API Change
```
refactor(api)!: remove deprecated v1 authentication endpoint

BREAKING CHANGE: The /api/v1/auth endpoint is no longer available.

Migrate to /api/v2/auth which uses JWT tokens instead of sessions.
See migration guide at docs/migration-v1-to-v2.md

Closes #1234
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Breaking Database Change
```
feat(db)!: change user id from string to uuid

BREAKING CHANGE: User ID format changed from string to UUID v4.

All existing integrations must update to handle new ID format.
Migration script available in scripts/migrate-user-ids.sql

See docs/migration-guides/uuid-migration.md for details.

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Spike/Experiment Commits

### Investigation Spike
```
perf(spike): benchmark different caching strategies

Tested 3 approaches for user session caching:
1. In-memory cache (simple, limited by memory)
2. Redis cache (distributed, requires infrastructure)
3. Database cache (durable, slower performance)

Recommendation: Use Redis for best balance of performance and scale.
Detailed benchmark results in spike-cache/RESULTS.md

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Architecture Spike
```
feat(spike): prototype microservice architecture

Created minimal working example of microservice setup:
- User service on port 3001
- Auth service on port 3002
- API gateway on port 3000
- Service discovery with Consul

Trade-offs analyzed in spike-microservices/ANALYSIS.md

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Common Patterns

### Short Form (Preferred for simple changes)
```
feat(scope): brief description under 50 chars
```

### Extended Form (Recommended for complex changes)
```
feat(scope): brief description

Longer explanation of why this change was necessary
and what problem it solves.

- Bullet point for each key change
- Easy to scan

Refs: #123
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Multi-scope Changes (If unavoidable)
```
feat(auth,api): add user authentication to API endpoints

Updated both auth service and api layer to integrate authentication:
- Auth service: new token verification method
- API layer: middleware to validate tokens

This is rare and usually indicates commit should be split.

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Key Takeaways

✓ **Type matters** - type(scope) quickly communicates intent
✓ **Scope matters** - identifies area of change
✓ **Subject matters** - should be scannable in git log
✓ **Body matters** - explains *why*, not *what*
✓ **Footer matters** - links issue references and attribution

All examples follow:
- Imperative mood ("add", "fix", not "added", "fixed")
- Maximum 50 characters for subject line
- Maximum 72 characters for body lines
- Blank line between subject and body
- Claude Code footer for AI-assisted work
