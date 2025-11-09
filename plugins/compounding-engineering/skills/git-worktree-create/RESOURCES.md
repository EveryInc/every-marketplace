# Git Worktree Resources

Curated collection of official documentation, guides, and community resources for git worktree workflows.

## Official Git Documentation

### Primary References
- **git-worktree(1) Manual Page**: https://git-scm.com/docs/git-worktree
  - Complete command reference
  - All options and flags documented
  - Examples and use cases

- **Git Book - Git Tools**: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
  - Conceptual understanding
  - Integration with other Git features

### Specific Commands
- **git worktree add**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-addltpathgtltcommit-ishgt
- **git worktree list**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-listltoptionsgt
- **git worktree remove**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-removeltworktreegt
- **git worktree prune**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-pruneltoptionsgt
- **git worktree lock/unlock**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-lockltoptionsgt
- **git worktree repair**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-repairltpathgt

## Community Guides and Tutorials

### Comprehensive Guides
- **Practical Guide to Git Worktree** (DEV Community)
  https://dev.to/yankee/practical-guide-to-git-worktree-58o0
  - Real-world workflow examples
  - Context switching strategies
  - Navigation tips

- **Mastering Git Worktree** (Medium)
  https://mskadu.medium.com/mastering-git-worktree-a-developers-guide-to-multiple-working-directories-c30f834f79a5
  - Developer perspective
  - Multiple working directories
  - Advanced patterns

- **Git Worktree Best Practices** (GitHub Gist)
  https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc
  - Curated best practices
  - Team workflows
  - CI/CD integration

### Quick Starts
- **Gentle Introduction to Git Worktree** (GitHub Gist)
  https://gist.github.com/ThomasFrans/ab1cb531410ab0cd0616a88a735dd840
  - Beginner-friendly
  - Step-by-step examples

- **Use Git Worktree and Never Switch Branches** (TheServerSide)
  https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/Use-this-git-worktree-add-example-and-never-switch-branches-again
  - Focused workflow
  - Branch switching alternative

### Specialized Topics
- **Experiment Freely with Git Worktree** (Opensource.com)
  https://opensource.com/article/21/4/git-worktree
  - Experimentation workflows
  - Safe testing environments

- **Rethink Your Git Workflow** (GeekMonkey)
  https://geekmonkey.org/rethink-your-git-workflow-with-git-worktree/
  - Workflow transformation
  - Team adoption strategies

## Tool Integrations

### Command-Line Tools
- **wt** - Worktree navigation CLI
  - Faster switching between worktrees
  - Partial directory name matching
  - Mentioned in DEV Community guide

### IDE Support
- **VS Code**: Native support for multiple worktrees
- **JetBrains IDEs**: Worktree detection and management
- **Git clients**: GitKraken, Tower, etc. have varying support

## Related Git Features

### Complementary Commands
- **git stash**: https://git-scm.com/docs/git-stash
  - Alternative for simple context switches
  - When worktrees might be overkill

- **git sparse-checkout**: https://git-scm.com/docs/git-sparse-checkout
  - Combine with --no-checkout worktrees
  - Partial worktree checkouts

- **git branch**: https://git-scm.com/docs/git-branch
  - Understanding branch management
  - Cleanup after worktree removal

## Stack Overflow Discussions

### Key Questions
- **What would I use git-worktree for?**
  https://stackoverflow.com/questions/31935776/what-would-i-use-git-worktree-for
  - Use case discussions
  - Community experiences
  - Real-world scenarios

## Related Git Features

- **git bisect**: https://git-scm.com/docs/git-bisect
  - Binary search for bug introduction
  - Works well with worktrees for testing

- **git rebase**: https://git-scm.com/docs/git-rebase
  - Interactive rebase in isolated worktrees
  - Safer experimentation

## Videos and Presentations

Search for current video content on YouTube and conference sites for:
- Git worktree demonstrations
- Conference talks on advanced Git workflows
- Screen casts and tutorials

## This Repository's Implementation

### Compounding Engineering Plugin
- **git-worktree-create skill**: Creates isolated worktrees with best practices
- **git-worktree-manage skill**: Lifecycle management and cleanup
- **git-worktree-best-practices skill**: Team conventions and patterns
- **create-worktree.sh script**: Automation for common patterns

### Related Commands
- **/work**: Feature development with worktree isolation
- **/review**: PR review in dedicated worktrees

## Contributing

Found a great resource? Add it to this list!

1. Ensure the resource is:
   - High quality and accurate
   - Currently maintained (check publication date)
   - Adds value not covered by existing resources

2. Submit PR with:
   - Link and description
   - Category placement
   - Brief explanation of value

## Last Updated

November 2025
