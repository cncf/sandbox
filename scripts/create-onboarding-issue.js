const fs = require('fs');
const path = require('path');

/**
 * Check if an onboarding issue already exists for a project
 * @param {Object} github - GitHub API client
 * @param {Object} context - GitHub context
 * @param {string} projectName - Name of the project
 * @returns {Promise<{exists: boolean, issueNumber: number|null, state: string|null}>}
 */
async function checkExistingOnboardingIssue(github, context, projectName) {
  // Escape special characters that could affect GitHub search query
  // GitHub search special characters: " \ + - & | ! ( ) { } [ ] ^ ~ * ? :
  const sanitizedProjectName = projectName.replace(/["\\]/g, '\\$&');
  
  // Search for existing onboarding issues (both open and closed) with title matching [PROJECT ONBOARDING] {projectName}
  const searchQuery = `repo:${context.repo.owner}/${context.repo.repo} is:issue "[PROJECT ONBOARDING] ${sanitizedProjectName}" in:title`;
  
  console.log(`🔍 Searching for existing onboarding issues with query: ${searchQuery}`);
  
  const searchResults = await github.rest.search.issuesAndPullRequests({
    q: searchQuery,
    sort: 'created',
    order: 'desc',
    per_page: 10
  });
  
  console.log(`   Found ${searchResults.data.total_count} matching issues`);
  
  // Check if any of the results have the exact title match
  // Note: GitHub search with quotes finds the phrase within the title, but may return partial matches.
  // We need to verify exact title match to avoid false positives.
  for (const issue of searchResults.data.items) {
    const expectedTitle = `[PROJECT ONBOARDING] ${projectName}`;
    if (issue.title === expectedTitle) {
      console.log(`   ✅ Found existing onboarding issue #${issue.number} (state: ${issue.state})`);
      return {
        exists: true,
        issueNumber: issue.number,
        state: issue.state
      };
    }
  }
  
  console.log(`   No existing onboarding issue found for "${projectName}"`);
  return {
    exists: false,
    issueNumber: null,
    state: null
  };
}

async function createOnboardingIssue(github, context, projectName, originalIssueNumber) {
  // Check if an onboarding issue already exists for this project
  const existing = await checkExistingOnboardingIssue(github, context, projectName);
  
  if (existing.exists) {
    console.log(`⚠️  Onboarding issue already exists for "${projectName}": #${existing.issueNumber} (${existing.state})`);
    return {
      issueNumber: existing.issueNumber,
      alreadyExists: true,
      state: existing.state
    };
  }
  // Read the onboarding template
  const templatePath = path.join(process.cwd(), '.github/ISSUE_TEMPLATE/project-onboarding.md');
  let templateContent = fs.readFileSync(templatePath, 'utf8');
  
  // Extract YAML front matter to get assignees and labels
  const yamlMatch = templateContent.match(/^---\n([\s\S]*?)\n---\n/);
  let assignees = [];
  let labels = ['project onboarding', 'sandbox', 'contribution-agreement/unsigned'];
  
  if (yamlMatch) {
    const yamlContent = yamlMatch[1];
    
    // Extract assignees
    const assigneesMatch = yamlContent.match(/^assignees:\s*(.+)$/m);
    if (assigneesMatch) {
      assignees = assigneesMatch[1].split(',').map(a => a.trim());
    }
    
    // Extract labels
    const labelsMatch = yamlContent.match(/^labels:\s*(.+)$/m);
    if (labelsMatch) {
      labels = labelsMatch[1].split(',').map(l => l.trim());
    }
  }
  
  // Remove YAML front matter from content
  templateContent = templateContent.replace(/^---\n[\s\S]*?\n---\n/, '');
  
  console.log('Extracted assignees from template:', assignees);
  console.log('Extracted labels from template:', labels);
  
  // Add reference link at the top after the welcome message
  templateContent = templateContent.replace(
    /(# Welcome to CNCF Project Onboarding)/,
    `$1\n\nref: #${originalIssueNumber}`
  );
  
  // Add reference to original issue at the bottom
  templateContent += `\n\n---\n\n**Related Issue:** This onboarding issue was automatically created after the community vote was completed in issue #${originalIssueNumber}.`;
  
            // Create the onboarding issue
            const onboardingIssue = await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[PROJECT ONBOARDING] ${projectName}`,
              body: templateContent,
              labels: labels,
              assignees: assignees
            });
  
  console.log('Created onboarding issue:', onboardingIssue.data.number);
  return {
    issueNumber: onboardingIssue.data.number,
    alreadyExists: false,
    state: 'open'
  };
}

async function commentAndClose(github, context, originalIssueNumber, onboardingIssueNumber, projectName) {
  // Comment on the original issue
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: originalIssueNumber,
    body: `🎉 Congratulations! The onboarding issue has been created for **${projectName}**.

The community vote has been completed successfully, and your project is now ready to begin the CNCF onboarding process.

**Next Steps:**
- Please review and work through the tasks in the onboarding issue: #${onboardingIssueNumber}
- Complete onboarding within one month of acceptance
- Contact CNCF staff if you have any questions

Good luck with your project's journey in the CNCF! 🚀`
  });
  
  // Close the original issue
  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: originalIssueNumber,
    state: 'closed'
  });
  
  console.log(`✅ Commented on issue #${originalIssueNumber} and closed it`);
  console.log(`✅ Created onboarding issue #${onboardingIssueNumber}`);
}

module.exports = {
  createOnboardingIssue,
  commentAndClose,
  checkExistingOnboardingIssue
};
