const fs = require('fs');
const path = require('path');

/**
 * Calculate the time since an issue was created
 * @param {string} createdAt - ISO date string
 * @returns {Object} Time breakdown in months, weeks, days
 */
function getTimeSinceCreation(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  return { days, weeks, months };
}

/**
 * Get the appropriate label and action based on time since creation
 * @param {Object} timeInfo - Time breakdown object
 * @returns {Object} Label and action information
 */
function getProgressAction(timeInfo) {
  const { months, weeks, days } = timeInfo;
  
  // Month 11 logic: weeks 1-3 weekly, week 4 daily
  if (months === 11) {
    const weekInMonth = Math.floor((days % 30) / 7) + 1;
    const dayInWeek = (days % 7) + 1;
    
    if (weekInMonth <= 3) {
      // Weekly warnings for weeks 1-3
      return {
        label: 'onboarding/approaching-archival',
        action: 'weekly_warning',
        weekInMonth,
        dayInWeek
      };
    } else {
      // Daily warnings for week 4
      return {
        label: 'onboarding/approaching-archival',
        action: 'daily_warning',
        weekInMonth,
        dayInWeek
      };
    }
  }
  
  // Other month milestones
  if (months >= 12) {
    return { label: 'onboarding/archived', action: 'archive' };
  } else if (months >= 10) {
    return { label: 'onboarding/approaching-archival', action: 'create_health_issue' };
  } else if (months >= 9) {
    return { label: 'onboarding/warning', action: 'tag_teams' };
  } else if (months >= 6) {
    return { label: 'onboarding/stale', action: 'tag_teams' };
  } else if (months >= 3) {
    return { label: 'onboarding/incomplete', action: 'comment' };
  }
  
  return null;
}

/**
 * Create a comment for the onboarding issue
 * @param {Object} timeInfo - Time breakdown
 * @param {Object} actionInfo - Action information
 * @param {string} projectName - Name of the project
 * @returns {string} Comment content
 */
function createComment(timeInfo, actionInfo, projectName) {
  const { months, weeks, days } = timeInfo;
  
  let comment = `## ⚠️ Onboarding Progress Alert for ${projectName}\n\n`;
  
  if (actionInfo.action === 'archive') {
    comment += `🚨 **CRITICAL**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `This project has exceeded the 1-year onboarding deadline and will be automatically archived.\n\n`;
    comment += `**Action Taken:**\n`;
    comment += `- ✅ Applied \`onboarding/archived\` label\n`;
    comment += `- ✅ Closed this onboarding issue\n`;
    comment += `- ✅ Commented on health issue in TOC repository\n\n`;
    comment += `The project will need to reapply for CNCF Sandbox status if they wish to continue.\n\n`;
    comment += `---\n*This action was taken automatically by the CNCF onboarding progress monitor.*`;
    
  } else if (actionInfo.action === 'daily_warning') {
    comment += `🚨 **FINAL WARNING**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `**Daily Warning #${dayInWeek}** - This project will be automatically archived in **${30 - (days % 30)} days**.\n\n`;
    comment += `**Immediate Action Required:**\n`;
    comment += `- Complete all remaining onboarding tasks\n`;
    comment += `- Contact CNCF staff if you need assistance\n`;
    comment += `- Update this issue with your progress\n\n`;
    comment += `**Timeline:**\n`;
    comment += `- Tomorrow: Another daily warning\n`;
    comment += `- If all tasks are not completed in the next ${30 - (days % 30)} days: Automatic archival\n\n`;
    comment += `---\n*This is an automated daily warning from the CNCF onboarding progress monitor.*`;
    
  } else if (actionInfo.action === 'weekly_warning') {
    comment += `⚠️ **WARNING**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `**Weekly Warning #${actionInfo.weekInMonth}** - This project will be automatically archived in **${365 - days} days**.\n\n`;
    comment += `**Action Required:**\n`;
    comment += `- Complete remaining onboarding tasks\n`;
    comment += `- Contact CNCF staff if assistance is needed\n`;
    comment += `- Update this issue with progress\n\n`;
    comment += `**Timeline:**\n`;
    comment += `- Next week: Another weekly warning\n`;
    comment += `- Week 4: Daily warnings will begin\n`;
    comment += `- If all tasks are not completed in the next ${365 - days} days: Automatic archival\n\n`;
    comment += `---\n*This is an automated weekly warning from the CNCF onboarding progress monitor.*`;
    
  } else if (actionInfo.action === 'create_health_issue') {
    comment += `⚠️ **APPROACHING DEADLINE**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `This project is approaching the 1-year onboarding deadline and will be automatically archived if not completed.\n\n`;
    comment += `**Actions Taken:**\n`;
    comment += `- ✅ Applied \`onboarding/approaching-archival\` label\n`;
    comment += `- ✅ Created health issue in TOC repository for visibility\n\n`;
    comment += `**Next Steps:**\n`;
    comment += `- Complete all remaining onboarding tasks\n`;
    comment += `- Contact CNCF staff immediately if assistance is needed\n\n`;
    comment += `**Timeline:**\n`;
    comment += `- In 1 month: Weekly warnings will begin\n`;
    comment += `- If all tasks are not completed in the next 2 months: Automatic archival\n\n`;
    comment += `---\n*This is an automated alert from the CNCF onboarding progress monitor.*`;
    
  } else if (actionInfo.action === 'tag_teams') {
    const urgency = months >= 9 ? 'HIGH PRIORITY' : 'PRIORITY';
    comment += `📋 **${urgency}**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `**Actions Taken:**\n`;
    comment += `- ✅ Applied \`${actionInfo.label}\` label\n`;
    comment += `- ✅ Tagged TOC and projects team for visibility\n\n`;
    comment += `**Next Steps:**\n`;
    comment += `- Complete remaining onboarding tasks\n`;
    comment += `- Contact CNCF staff if assistance is needed\n`;
    comment += `- Update this issue with progress\n\n`;
    comment += `**Timeline:**\n`;
    comment += `- If all tasks are not completed in the next ${3 - (months % 3)} months: Health issue will be created\n`;
    comment += `- If all tasks are not completed in the next ${6 - (months % 6)} months: Automatic archival\n\n`;
    comment += `---\n*This is an automated alert from the CNCF onboarding progress monitor.*`;
    
  } else {
    comment += `📝 **REMINDER**: This onboarding issue has been open for **${months} months** (${days} days).\n\n`;
    comment += `**Action Taken:**\n`;
    comment += `- ✅ Applied \`onboarding/incomplete\` label\n\n`;
    comment += `**Next Steps:**\n`;
    comment += `- Complete remaining onboarding tasks\n`;
    comment += `- Contact CNCF staff if assistance is needed\n`;
    comment += `- Update this issue with progress\n\n`;
    comment += `**Timeline:**\n`;
    comment += `- If all tasks are not completed in the next ${3 - (months % 3)} months: TOC team will be tagged\n`;
    comment += `- If all tasks are not completed in the next ${9 - months} months: Automatic archival\n\n`;
    comment += `---\n*This is an automated reminder from the CNCF onboarding progress monitor.*`;
  }
  
  return comment;
}

/**
 * Create a health issue in the TOC repository using the proper project-health.yaml template
 * This matches the structure defined in https://github.com/cncf/toc/blob/main/.github/ISSUE_TEMPLATE/project-health.yaml
 * 
 * @param {Object} github - GitHub API client
 * @param {Object} context - GitHub context
 * @param {string} projectName - Name of the project
 * @param {number} onboardingIssueNumber - Number of the onboarding issue
 * @param {number} monthsInOnboarding - How many months the project has been in onboarding
 * @returns {Promise<number>} Health issue number
 */
async function createHealthIssue(github, context, projectName, onboardingIssueNumber, monthsInOnboarding = 10) {
  // Calculate remaining time until archival (12 months total)
  const remainingMonths = 12 - monthsInOnboarding;
  const onboardingIssueUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/issues/${onboardingIssueNumber}`;
  
  // Format the issue body to match the project-health.yaml template structure
  // Note: When creating via API, we format as if manually filling out the form
  const healthIssueBody = `### Purpose of This Issue

This Project Health Issue has been filed to ascertain the current activity and health of the project so the TOC may identify the appropriate support and guidance for the project to return to an optimal state of health or determination of archival.

It is intended to **initiate a public discussion to seek understanding** and define a path forward. Perceptions or commentary counter to this are not constructive for the project or the community.

Should maintainers have sensitive, confidential, or private factors and concerns that influence or affect the project, they are encouraged to contact the TOC or TOC Staff directly via Slack, or email.

---

### Project name

${projectName}

### Project On-boarding issue

${onboardingIssueUrl}

### Concern

This sandbox project has been in the onboarding process for **${monthsInOnboarding}+ months** and is approaching the automatic archival deadline. The project has not completed the required onboarding tasks within the expected timeframe.

**Potential Indicators:**
- Lack of active maintainer engagement
- Insufficient resources to complete onboarding requirements
- Project may no longer be actively maintained
- Need for additional support or guidance from CNCF staff

**Timeline:**
- **Current Status:** ${monthsInOnboarding}+ months in onboarding process
- **Archival Deadline:** 12 months from onboarding issue creation
- **Time Remaining:** ~${remainingMonths} month(s)

**Onboarding Issue:** [#${onboardingIssueNumber}](${onboardingIssueUrl})

**Automated Detection:** This health issue was automatically created by the CNCF onboarding progress monitoring system when the project reached the ${monthsInOnboarding}-month milestone, as part of proactive intervention before automatic archival.

**Recent Activity:**
Please review the onboarding issue for the current status of completion checklist items and any recent maintainer updates.

### Prior engagement

This is an automated health check triggered by the onboarding progress monitoring system. 

Prior to this health issue:
- **3 months:** Automated reminder with \`onboarding/incomplete\` label
- **6 months:** Automated alert with \`onboarding/stale\` label + TOC/projects team notification
- **9 months:** Automated warning with \`onboarding/warning\` label + TOC/projects team notification
- **10 months:** This health issue created with \`onboarding/approaching-archival\` label

No direct TOC engagement has been initiated for this specific onboarding delay beyond automated monitoring.

### Additional Information

**About the Automated Monitor:**

The CNCF onboarding progress monitor automatically tracks sandbox project onboarding progress and creates health issues for projects that have been in the onboarding process for 10+ months. This ensures timely TOC awareness and intervention opportunity before automatic archival occurs at the 12-month mark.

**Suggested Next Steps for TOC:**
1. Review the onboarding issue to assess current completion status
2. Contact project maintainers to understand any blockers or challenges
3. Determine if the project requires additional CNCF staff support
4. Evaluate if a deadline extension is warranted based on circumstances
5. Provide specific guidance for completing remaining onboarding tasks
6. Assess project's continued alignment with sandbox requirements

**Automated Actions Already Taken:**
- Progressive labels applied at 3, 6, 9, and 10-month milestones
- Automated comments with reminders at each milestone
- TOC/projects team tagged at 6 and 9-month marks
- Weekly warnings scheduled to begin at 11 months
- Daily warnings scheduled for the final week before archival

**If No Action Taken:**
- **11 months:** Weekly warnings will be posted (weeks 1-3), then daily warnings (week 4)
- **12 months:** Project will be automatically archived, onboarding issue closed, and this health issue updated

---

*This health issue was automatically created by the [CNCF Sandbox Onboarding Progress Monitor](https://github.com/cncf/sandbox). For questions about this automation, please contact CNCF staff or open an issue in the sandbox repository.*`;

  try {
    const healthIssue = await github.rest.issues.create({
      owner: 'cncf',
      repo: 'toc',
      title: `[HEALTH]: ${projectName} - Onboarding Deadline Approaching (${monthsInOnboarding}+ Months)`,
      body: healthIssueBody,
      labels: ['needs-triage', 'toc', 'kind/review', 'review/health']
      // Note: Not adding assignees automatically - let TOC triage process handle assignment
    });
    
    console.log(`✅ Created health issue #${healthIssue.data.number} in cncf/toc`);
    console.log(`   URL: https://github.com/cncf/toc/issues/${healthIssue.data.number}`);
    return healthIssue.data.number;
  } catch (error) {
    console.error('❌ Failed to create health issue in cncf/toc:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

/**
 * Check if we should skip this issue based on recent activity
 * @param {Object} issue - GitHub issue object
 * @param {Object} actionInfo - Action information
 * @param {boolean} checkAll - Whether to check all issues regardless of existing labels
 * @returns {boolean} True if we should skip
 */
function shouldSkipIssue(issue, actionInfo, checkAll = false) {
  // If checkAll is true, only skip based on recent activity, not existing labels
  if (checkAll) {
    // For daily warnings, only proceed if it's been at least 1 day since last comment
    if (actionInfo.action === 'daily_warning') {
      const lastComment = issue.comments > 0 ? new Date(issue.updated_at) : new Date(issue.created_at);
      const hoursSinceLastUpdate = (new Date() - lastComment) / (1000 * 60 * 60);
      return hoursSinceLastUpdate < 20; // Skip if updated within last 20 hours
    }
    
    // For weekly warnings, only proceed if it's been at least 6 days since last comment
    if (actionInfo.action === 'weekly_warning') {
      const lastComment = issue.comments > 0 ? new Date(issue.updated_at) : new Date(issue.created_at);
      const daysSinceLastUpdate = (new Date() - lastComment) / (1000 * 60 * 60 * 24);
      return daysSinceLastUpdate < 6; // Skip if updated within last 6 days
    }
    
    // For other actions, don't skip based on existing labels when checkAll is true
    return false;
  }
  
  // Normal operation - skip based on recent activity AND existing labels
  // For daily warnings, only proceed if it's been at least 1 day since last comment
  if (actionInfo.action === 'daily_warning') {
    const lastComment = issue.comments > 0 ? new Date(issue.updated_at) : new Date(issue.created_at);
    const hoursSinceLastUpdate = (new Date() - lastComment) / (1000 * 60 * 60);
    return hoursSinceLastUpdate < 20; // Skip if updated within last 20 hours
  }
  
  // For weekly warnings, only proceed if it's been at least 6 days since last comment
  if (actionInfo.action === 'weekly_warning') {
    const lastComment = issue.comments > 0 ? new Date(issue.updated_at) : new Date(issue.created_at);
    const daysSinceLastUpdate = (new Date() - lastComment) / (1000 * 60 * 60 * 24);
    return daysSinceLastUpdate < 6; // Skip if updated within last 6 days
  }
  
  // For other actions, check if we've already processed this milestone
  const existingLabels = issue.labels.map(label => label.name);
  return existingLabels.includes(actionInfo.label);
}

/**
 * Sleep helper for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check GitHub API rate limit and log status
 * @param {Object} github - GitHub API client
 */
async function checkRateLimit(github) {
  try {
    const rateLimit = await github.rest.rateLimit.get();
    const remaining = rateLimit.data.rate.remaining;
    const limit = rateLimit.data.rate.limit;
    const reset = new Date(rateLimit.data.rate.reset * 1000);
    
    console.log(`📊 API Rate Limit: ${remaining}/${limit} remaining (resets at ${reset.toISOString()})`);
    
    if (remaining < 100) {
      console.warn(`⚠️  Warning: Low API rate limit remaining (${remaining})`);
    }
    
    return { remaining, limit, reset };
  } catch (error) {
    console.warn('⚠️  Could not check rate limit:', error.message);
    return null;
  }
}

/**
 * Main function to monitor onboarding progress
 * @param {Object} github - GitHub API client
 * @param {Object} context - GitHub context
 * @param {boolean} checkAll - Whether to check all issues regardless of age
 */
async function monitorOnboardingProgress(github, context, checkAll = false) {
  try {
    // Check rate limit before starting
    await checkRateLimit(github);
    
    // Get all open issues with onboarding labels
    // Note: Onboarding issues MUST have title format: [PROJECT ONBOARDING] {project name}
    // and labels: 'project onboarding' and 'sandbox'
    const issues = await github.rest.issues.listForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      labels: 'project onboarding,sandbox',
      per_page: 100
    });
    
    console.log(`Found ${issues.data.length} issues with onboarding labels to check`);
    
    if (checkAll) {
      console.log('🚀 INITIAL DEPLOYMENT: Will process all issues regardless of existing labels');
      console.log('   This ensures all existing onboarding issues get properly labeled based on their age');
    } else {
      console.log('🔄 REGULAR MONITORING: Will skip issues that already have appropriate labels');
    }
    
    for (const issue of issues.data) {
      try {
        // Extract project name from issue title
        // IMPORTANT: Onboarding issues MUST have title format: [PROJECT ONBOARDING] {project name}
        const titleMatch = issue.title.match(/^\[PROJECT ONBOARDING\]\s*(.+)$/);
        if (!titleMatch) {
          console.log(`⚠️  Skipping issue #${issue.number} - title doesn't match [PROJECT ONBOARDING] format`);
          console.log(`   Title: "${issue.title}"`);
          continue;
        }
        
        const projectName = titleMatch[1].trim();
        
        // Validate we extracted a project name
        if (!projectName || projectName.length === 0) {
          console.log(`⚠️  Skipping issue #${issue.number} - could not extract project name from title`);
          console.log(`   Title: "${issue.title}"`);
          continue;
        }
        
        // Check if issue has the extension/exception label
        const issueLabels = issue.labels.map(label => label.name);
        if (issueLabels.includes('onboarding/extended')) {
          console.log(`⏸️  Skipping issue #${issue.number} - has onboarding/extended label`);
          console.log(`   Project has been granted a timeline extension by CNCF staff`);
          continue;
        }
        
        // Only process issues created after October 1, 2025
        const cutoffDate = new Date('2025-10-01T00:00:00Z');
        const createdDate = new Date(issue.created_at);
        
        if (createdDate < cutoffDate) {
          console.log(`⏭️  Skipping issue #${issue.number} - created before October 1, 2025`);
          console.log(`   Created: ${createdDate.toISOString().split('T')[0]}`);
          continue;
        }
        
        const timeInfo = getTimeSinceCreation(issue.created_at);
        const actionInfo = getProgressAction(timeInfo);
        
        console.log(`📋 Processing issue #${issue.number}: "${projectName}"`);
        console.log(`   Age: ${timeInfo.months} months, ${timeInfo.weeks} weeks, ${timeInfo.days} days`);
        
        if (!actionInfo) {
          console.log(`   ✅ No action needed (age: ${timeInfo.months} months)`);
          continue;
        }
        
        console.log(`   Action: ${actionInfo.action}, Label: ${actionInfo.label}`);
        
        // Skip if we shouldn't process this issue
        if (shouldSkipIssue(issue, actionInfo, checkAll)) {
          console.log(`   ⏭️  Skipping - recently updated or already processed`);
          continue;
        }
        
        // Apply the label
        await github.rest.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          labels: [actionInfo.label]
        });
        
        console.log(`   ✅ Applied label: ${actionInfo.label}`);
        
        // Create appropriate comment
        const comment = createComment(timeInfo, actionInfo, projectName);
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          body: comment
        });
        
        console.log(`   ✅ Added comment`);
        
        // Handle special actions
        if (actionInfo.action === 'create_health_issue') {
          const healthIssueNumber = await createHealthIssue(github, context, projectName, issue.number, timeInfo.months);
          if (healthIssueNumber) {
            // Add a comment with the health issue reference
            const healthIssueComment = `\n\n---\n\n**🏥 Health Issue Created in TOC Repository**\n\nA health issue has been created for TOC review: [cncf/toc#${healthIssueNumber}](https://github.com/cncf/toc/issues/${healthIssueNumber})\n\nThe TOC will review this issue and may reach out to maintainers to assess the current status and provide support.`;
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issue.number,
              body: healthIssueComment
            });
            console.log(`   ✅ Added health issue reference comment to onboarding issue`);
          }
        }
        
        if (actionInfo.action === 'tag_teams') {
          // Tag TOC and projects team (update with actual usernames)
          await github.rest.issues.addAssignees({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issue.number,
            assignees: [] // Add TOC member usernames here when deploying
          });
        }
        
        if (actionInfo.action === 'archive') {
          // Close the onboarding issue
          await github.rest.issues.update({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issue.number,
            state: 'closed'
          });
          
          console.log(`   ✅ Closed onboarding issue`);
          
          // Try to find and update the health issue in the TOC repo
          try {
            // Search for health issues mentioning this onboarding issue
            const searchQuery = `repo:cncf/toc is:issue is:open label:review/health "${projectName}" in:title`;
            const searchResults = await github.rest.search.issuesAndPullRequests({
              q: searchQuery,
              sort: 'created',
              order: 'desc',
              per_page: 5
            });
            
            if (searchResults.data.total_count > 0) {
              const healthIssue = searchResults.data.items[0];
              
              const archivalComment = `## 🗄️ Project Archived - Onboarding Incomplete

This health issue is being updated as the associated onboarding process has reached the 12-month deadline without completion.

**Onboarding Issue:** [cncf/sandbox#${issue.number}](https://github.com/${context.repo.owner}/${context.repo.repo}/issues/${issue.number}) - **CLOSED**

**Action Taken:**
- ✅ Applied \`onboarding/archived\` label to onboarding issue
- ✅ Closed onboarding issue
- ✅ Automated monitoring cycle completed

**Status:**
The project has been automatically archived due to exceeding the 12-month onboarding timeline. The onboarding requirements were not completed within the allocated timeframe.

**Next Steps:**
The TOC may choose to:
1. Close this health issue if no further action is needed
2. Reach out to maintainers for a final status update
3. Determine if the project should be allowed to reapply in the future

If the project wishes to rejoin the CNCF Sandbox in the future, they will need to submit a new application through the standard process.

---
*This update was automatically posted by the CNCF Sandbox Onboarding Progress Monitor.*`;
              
              await github.rest.issues.createComment({
                owner: 'cncf',
                repo: 'toc',
                issue_number: healthIssue.number,
                body: archivalComment
              });
              
              console.log(`   ✅ Updated health issue cncf/toc#${healthIssue.number}`);
            } else {
              console.log(`   ⚠️  No matching health issue found in TOC repo`);
            }
          } catch (searchError) {
            console.error(`   ⚠️  Failed to update health issue: ${searchError.message}`);
            // Don't fail the whole process if we can't update the health issue
          }
        }
        
        console.log(`   ✅ Completed processing issue #${issue.number}`);
        
      } catch (error) {
        console.error(`❌ Error processing issue #${issue.number}:`, error.message);
        if (error.response) {
          console.error(`   HTTP Status: ${error.response.status}`);
          if (error.response.status === 403) {
            console.error('   This may be a rate limit error. Consider slowing down or waiting.');
          }
        }
        // Continue processing other issues even if one fails
      }
      
      // Add a small delay between issues to avoid rate limiting
      if (issues.data.length > 10) {
        await sleep(1000); // 1 second delay between issues
      }
    }
    
    console.log('🎉 Onboarding progress monitoring completed');
    
    // Check final rate limit status
    await checkRateLimit(github);
    
  } catch (error) {
    console.error('❌ Error in onboarding progress monitoring:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

module.exports = {
  monitorOnboardingProgress,
  getTimeSinceCreation,
  getProgressAction,
  createComment,
  createHealthIssue,
  checkRateLimit,
  sleep
};
