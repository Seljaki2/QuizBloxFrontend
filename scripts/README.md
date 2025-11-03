# Scripts

This directory contains utility scripts for the QuizBloxFrontend project.

## commit-report.js

Generates a report of commits authored by each author, grouped by week, with automatic weekly summaries.

### Usage

**Display report in console:**
```bash
npm run commit-report
```

**Save report to a file:**
```bash
npm run commit-report:file
```

This will save the report to `commit-report.md` in the project root.

**Custom output file:**
```bash
node scripts/commit-report.js path/to/output.md
```

### Report Format

The generated report includes:
- Commits grouped by author
- Within each author, commits are grouped by ISO week (YYYY-Wnn format)
- **Weekly summaries** that automatically categorize work into:
  - Features & Additions
  - Fixes
  - Refactoring & Improvements
  - Merges
  - Other work
- Each commit shows the date/time and commit message
- A summary table showing total commits and weeks active per author

### Example Output

```markdown
# Commit Report by Author and Week

Generated: 2025-11-03T11:31:23.852Z

---

## MalachiVolta

### 2025-W45 (1 commit)

**Weekly Summary:**

**Features & Additions:** 1 commit(s) - "Add Reports page with table and chart features"

**Detailed Commits:**

1. **11/3/2025, 10:53:35 AM**: Add Reports page with table and chart features

## Summary

| Author | Total Commits | Weeks Active |
|--------|---------------|-------------|
| MalachiVolta | 1 | 1 |
```

### Testing with Different Branches

The script analyzes commits from all branches. You can test it on the main branch or any other branch by running it after fetching the desired branches:

```bash
git fetch origin main:main --depth=100
npm run commit-report
```
