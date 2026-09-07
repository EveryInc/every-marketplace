# Worktree preservation

Every tree-changing branch switch must preserve local work, including ignored paths, or stop before mutation. This applies to ordinary and stack workflows, including topology probes that move `HEAD`. A clean ordinary status or `git stash push -u` does not prove ignored paths are safe. Non-colliding changes may follow onto the new branch; do not require a clean worktree merely to branch.

Use `--no-overwrite-ignore` for direct Git checkouts that change trees. Before a `gh stack` operation that can change trees, establish that the installed command preserves local paths in the current state; if that cannot be established, stop with a residual before invoking it. Do not bypass a collision with force, cleanup, reset, or automatic stashing. Let the user handle colliding paths; `mode:pipeline` reports the blocker without asking. Saving planned layer changes does not authorize moving ignored data or `exclude:<paths>` files.
