const fs = require('fs');
const path = require('path');

async function createOnboardingIssue(github, context, projectName, originalIssueNumber) {
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
  return onboardingIssue.data.number;
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
  commentAndClose
};
