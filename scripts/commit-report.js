#!/usr/bin/env node

/**
 * Generates a report of commits authored by each author by week
 * Usage: node scripts/commit-report.js [output-file]
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

/**
 * Get all commits from git with author and date information
 */
function getGitCommits() {
  try {
    const output = execSync(
      'git log --all --pretty=format:"%an|%ae|%ad|%s" --date=iso',
      { encoding: 'utf-8' }
    );
    
    if (!output.trim()) {
      return [];
    }
    
    return output.trim().split('\n').map(line => {
      const [author, email, date, ...messageParts] = line.split('|');
      return {
        author: author.trim(),
        email: email.trim(),
        date: new Date(date.trim()),
        message: messageParts.join('|').trim()
      };
    });
  } catch (error) {
    console.error('Error fetching git commits:', error.message);
    return [];
  }
}

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Group commits by author and week
 */
function groupCommitsByAuthorAndWeek(commits) {
  const grouped = {};
  
  commits.forEach(commit => {
    const week = getWeekNumber(commit.date);
    const author = commit.author;
    
    if (!grouped[author]) {
      grouped[author] = {};
    }
    
    if (!grouped[author][week]) {
      grouped[author][week] = {
        count: 0,
        commits: []
      };
    }
    
    grouped[author][week].count++;
    grouped[author][week].commits.push({
      date: commit.date.toISOString(),
      message: commit.message
    });
  });
  
  return grouped;
}

/**
 * Generate a formatted report
 */
function generateReport(groupedData) {
  let report = '# Commit Report by Author and Week\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += '---\n\n';
  
  // Sort authors alphabetically
  const authors = Object.keys(groupedData).sort();
  
  authors.forEach(author => {
    report += `## ${author}\n\n`;
    
    // Sort weeks chronologically
    const weeks = Object.keys(groupedData[author]).sort();
    
    weeks.forEach(week => {
      const weekData = groupedData[author][week];
      report += `### ${week} (${weekData.count} commit${weekData.count !== 1 ? 's' : ''})\n\n`;
      
      weekData.commits.forEach((commit, index) => {
        const commitDate = new Date(commit.date).toLocaleString();
        report += `${index + 1}. **${commitDate}**: ${commit.message}\n`;
      });
      
      report += '\n';
    });
    
    report += '\n';
  });
  
  return report;
}

/**
 * Generate summary statistics
 */
function generateSummary(groupedData) {
  let summary = '## Summary\n\n';
  summary += '| Author | Total Commits | Weeks Active |\n';
  summary += '|--------|---------------|-------------|\n';
  
  const authors = Object.keys(groupedData).sort();
  
  authors.forEach(author => {
    const weeks = Object.keys(groupedData[author]);
    const totalCommits = weeks.reduce((sum, week) => {
      return sum + groupedData[author][week].count;
    }, 0);
    
    summary += `| ${author} | ${totalCommits} | ${weeks.length} |\n`;
  });
  
  return summary + '\n';
}

/**
 * Main function
 */
function main() {
  console.log('Generating commit report...\n');
  
  const commits = getGitCommits();
  
  if (commits.length === 0) {
    console.log('No commits found in the repository.');
    return;
  }
  
  console.log(`Found ${commits.length} commit(s)\n`);
  
  const groupedData = groupCommitsByAuthorAndWeek(commits);
  const report = generateReport(groupedData);
  const summary = generateSummary(groupedData);
  const fullReport = report + summary;
  
  // Determine output method
  const outputFile = process.argv[2];
  
  if (outputFile) {
    writeFileSync(outputFile, fullReport, 'utf-8');
    console.log(`Report saved to: ${outputFile}`);
  } else {
    console.log(fullReport);
  }
}

main();
