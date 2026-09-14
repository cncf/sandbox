const { loadRoster } = require('./assign-upcoming-reviewers.js');

const SANDBOX_TITLE_PREFIX = '[Sandbox]';
const VOTE_LABEL = 'gitvote';

async function unassignVoteReviewers(github, context, { dryRun = false } = {}) {
  const payload = context.payload || {};
  const issue = payload.issue;
  const label = payload.label;

  console.log(`🚀 Vote Label Unassign`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Event: ${context.eventName}/${payload.action}`);
  console.log(`   Issue: #${issue && issue.number} "${issue && issue.title}"`);
  console.log(`   Label added: ${label && label.name}`);

  if (payload.action !== 'labeled') {
    console.log(`ℹ️  Skipping: action is '${payload.action}', not 'labeled'`);
    return;
  }
  if (!label || label.name !== VOTE_LABEL) {
    console.log(`ℹ️  Skipping: label '${label && label.name}' is not '${VOTE_LABEL}'`);
    return;
  }
  if (!issue || !issue.title || !issue.title.startsWith(SANDBOX_TITLE_PREFIX)) {
    console.log(`ℹ️  Skipping: issue title does not start with '${SANDBOX_TITLE_PREFIX}'`);
    return;
  }

  const roster = await loadRoster(github);
  const rosterSet = new Set(roster);

  // Re-fetch to get current assignees; the webhook payload can be stale.
  const { data: fresh } = await github.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue.number,
  });
  const currentAssignees = (fresh.assignees || []).map(a => a.login);
  const toRemove = currentAssignees.filter(login => rosterSet.has(login));
  const keeping = currentAssignees.filter(login => !rosterSet.has(login));

  console.log(`   Current assignees: [${currentAssignees.join(', ') || '(none)'}]`);
  console.log(`   Roster to remove:  [${toRemove.join(', ') || '(none)'}]`);
  console.log(`   Keeping:           [${keeping.join(', ') || '(none)'}]`);

  if (toRemove.length === 0) {
    console.log(`✅ Nothing to do`);
    return;
  }

  if (dryRun) {
    console.log(`🧪 DRY RUN: would remove [${toRemove.join(', ')}] from #${issue.number}`);
    return;
  }

  const response = await github.rest.issues.removeAssignees({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue.number,
    assignees: toRemove,
  });
  const finalLogins = (response.data.assignees || []).map(a => a.login);
  const stillPresent = toRemove.filter(login => finalLogins.includes(login));

  console.log(`✅ #${issue.number}: removed [${toRemove.filter(l => !finalLogins.includes(l)).join(', ') || '(none)'}]`);
  if (stillPresent.length > 0) {
    throw new Error(`Failed to remove assignees from #${issue.number}: [${stillPresent.join(', ')}]`);
  }
}

module.exports = { unassignVoteReviewers };
