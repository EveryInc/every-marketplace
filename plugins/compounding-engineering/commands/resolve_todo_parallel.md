# /compounding-engineering:resolve_todo_parallel

## Goal

Resolve every outstanding TODO in `todos/*.md` by coordinating multiple `pr-comment-resolver` tasks in parallel, honoring dependencies, and committing the completed work back to the repository.

## Prerequisites

- `claude` CLI authenticated with access to `/compounding-engineering:resolve_todo_parallel` (optional alias: `alias resolve="claude /compounding-engineering:resolve_todo_parallel"`).
- Clean working tree with write access to `todos/` and related source files.
- Ability to commit and push to the current branch (Git configured, tests passing locally).
- `TodoWrite` capability enabled to capture grouped plans and progress.
- `pr-comment-resolver` Task agent available for launching one instance per TODO.

## Workflow

1. **Invoke the command**  
   ```bash
   claude /compounding-engineering:resolve_todo_parallel
   ```

2. **Analyze the backlog**  
   - Enumerate all unresolved TODO entries across `todos/*.md`.  
   - Capture each item’s file path, owner, blocking dependencies, and any linked tickets or PRs.

3. **Plan execution order**  
   - Build a `TodoWrite` list grouped by type (e.g., migrations, UI fixes, infra).  
   - Note dependencies that force sequential execution (e.g., rename before refactor).  
   - Produce a Mermaid flow diagram that communicates what can run in parallel versus serially:  
     ```mermaid
     flowchart TD
       rename[Rename model] --> docs[Update docs]
       rename --> api[Refactor API clients]
       tests[Add regression tests]
     ```  
   - Highlight which nodes can spawn concurrent Tasks and which must wait.

4. **Implement in parallel**  
   - Launch a `Task pr-comment-resolver(<todo>)` for every independent TODO, running as many as possible simultaneously:  
     ```bash
     Task pr-comment-resolver(todo_1)
     Task pr-comment-resolver(todo_2)
     Task pr-comment-resolver(todo_3)
     ```  
   - Keep downstream Tasks blocked until their prerequisites finish (per the Mermaid graph).  
   - Ensure each Task removes the TODO marker from code and logs progress back into the TodoWrite board.

5. **Commit and push**  
   - Verify all TODO markers are removed and the associated sections in `todos/*.md` are marked resolved.  
   - Run the standard git workflow:
     ```bash
     git status
     git add -A
     git commit -m "Resolve TODO batch"
     git push
     ```  
   - Summarize the mermaid flow and completion state in the PR or issue description.

## Success Criteria

- [ ] Every TODO found in `todos/*.md` is resolved or explicitly deferred with justification.  
- [ ] TodoWrite board shows grouped items, dependencies, and completion state.  
- [ ] Mermaid flow diagram communicates ordering so future contributors can understand the parallelization plan.  
- [ ] Each `pr-comment-resolver` Task ran in parallel whenever dependencies allowed.  
- [ ] Commits remove resolved TODO markers and are pushed to the remote branch.

## Troubleshooting

- **Problem:** Command cannot access `/compounding-engineering:resolve_todo_parallel`.  
  **Solution:** Re-authenticate `claude`, then confirm namespace availability via `claude namespaces list`.
- **Problem:** `TodoWrite` fails to create grouped entries.  
  **Solution:** Ensure the tool is enabled for the session or re-run the command after initializing TodoWrite with `TodoWrite.create("todo-batch", items)`.
- **Problem:** Parallel Tasks collide with shared files causing git conflicts.  
  **Solution:** Serialize conflicting Tasks, rebase on latest main, and re-run only the affected resolvers.
- **Problem:** Rate limits prevent launching all `pr-comment-resolver` Tasks simultaneously.  
  **Solution:** Dispatch Tasks in small batches while preserving dependency order, documenting any delays in the TodoWrite board.
