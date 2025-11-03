# Scripts

This directory contains utility scripts for the QuizBloxFrontend project.

## commit-report.js

Generates a report of commits authored by each author, grouped by week.

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
- Each commit shows the date/time and commit message
- A summary table showing total commits and weeks active per author

### Example Output

```markdown
# Commit Report by Author and Week

Generated: 2025-11-03T11:28:19.209Z

---

## MalachiVolta

### 2025-W45 (1 commit)

1. **11/3/2025, 11:21:41 AM**: Fix type annotation for answer mapping

## Summary

| Author | Total Commits | Weeks Active |
|--------|---------------|-------------|
| MalachiVolta | 1 | 1 |
```
