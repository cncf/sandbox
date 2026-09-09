const yaml = require('js-yaml');

const ROSTER_OWNER = 'cncf';
const ROSTER_REPO = 'people';
const ROSTER_PATH = 'config.yaml';
const ROSTER_REF = 'main';
const ROSTER_TEAM = 'cncf-toc';

const PROJECT_ORG = 'cncf';
const PROJECT_NUMBER = 14;
const SANDBOX_REPO_FULL = 'cncf/sandbox';
const TARGET_STATUS_RE = /upcoming/i;
const SANDBOX_TITLE_PREFIX = '[Sandbox]';
const SLOTS_PER_ISSUE = 2;

async function loadRoster(github) {
  console.log(`📥 Loading roster from ${ROSTER_OWNER}/${ROSTER_REPO}/${ROSTER_PATH}@${ROSTER_REF}`);
  const { data } = await github.rest.repos.getContent({
    owner: ROSTER_OWNER,
    repo: ROSTER_REPO,
    path: ROSTER_PATH,
    ref: ROSTER_REF,
  });
  if (!data || !data.content) {
    throw new Error(`Roster fetch returned no content`);
  }
  const raw = Buffer.from(data.content, data.encoding || 'base64').toString('utf8');
  const parsed = yaml.load(raw);
  const teams = parsed && parsed.teams;
  if (!Array.isArray(teams)) {
    throw new Error(`Roster YAML missing top-level 'teams' array`);
  }
  const team = teams.find(t => t && t.name === ROSTER_TEAM);
  if (!team) {
    throw new Error(`Roster YAML missing team '${ROSTER_TEAM}'`);
  }
  const members = Array.isArray(team.members) ? team.members.filter(m => typeof m === 'string' && m.length > 0) : [];
  if (members.length === 0) {
    throw new Error(`Roster team '${ROSTER_TEAM}' has empty members list`);
  }
  console.log(`   ✅ Roster (${members.length}): ${members.join(', ')}`);
  return members;
}

async function fetchUpcomingIssues(github) {
  console.log(`📥 Fetching items from ${PROJECT_ORG}/projects/${PROJECT_NUMBER}`);
  const query = `
    query($org: String!, $number: Int!, $cursor: String) {
      organization(login: $org) {
        projectV2(number: $number) {
          items(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  number
                  state
                  title
                  author { login }
                  repository { nameWithOwner }
                  assignees(first: 20) { nodes { login } }
                }
              }
              fieldValues(first: 20) {
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const upcoming = [];
  let cursor = null;
  let page = 0;
  do {
    page++;
    const result = await github.graphql(query, { org: PROJECT_ORG, number: PROJECT_NUMBER, cursor });
    const project = result && result.organization && result.organization.projectV2;
    if (!project) {
      throw new Error(`GraphQL returned no projectV2 for ${PROJECT_ORG}/projects/${PROJECT_NUMBER}`);
    }
    const items = project.items && project.items.nodes || [];
    for (const item of items) {
      const content = item.content;
      if (!content || content.__typename !== 'Issue') continue;
      if (!content.repository || content.repository.nameWithOwner !== SANDBOX_REPO_FULL) continue;
      if (content.state !== 'OPEN') continue;

      const statusValue = (item.fieldValues && item.fieldValues.nodes || []).find(v => {
        return v && v.__typename === 'ProjectV2ItemFieldSingleSelectValue'
          && v.field && v.field.name === 'Status';
      });
      const statusName = statusValue && statusValue.name;
      if (!statusName || !TARGET_STATUS_RE.test(statusName)) continue;

      upcoming.push({
        number: content.number,
        title: content.title,
        author: content.author && content.author.login || null,
        assignees: (content.assignees && content.assignees.nodes || []).map(a => a.login),
        status: statusName,
      });
    }
    cursor = project.items.pageInfo.hasNextPage ? project.items.pageInfo.endCursor : null;
    console.log(`   Page ${page}: scanned ${items.length} items, running upcoming total = ${upcoming.length}`);
  } while (cursor);

  console.log(`   ✅ Found ${upcoming.length} open Sandbox issue(s) in Upcoming status`);
  return upcoming;
}

async function computeLifetimeLoad(github, context, roster) {
  console.log(`📥 Computing lifetime assignment load across [Sandbox] issues in ${context.repo.owner}/${context.repo.repo}`);
  const rosterSet = new Set(roster);
  const load = new Map(roster.map(login => [login, 0]));

  const iterator = github.paginate.iterator(github.rest.issues.listForRepo, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'all',
    per_page: 100,
  });

  let scanned = 0;
  let sandboxMatches = 0;
  for await (const { data: page } of iterator) {
    for (const issue of page) {
      scanned++;
      if (issue.pull_request) continue;
      if (!issue.title || !issue.title.startsWith(SANDBOX_TITLE_PREFIX)) continue;
      sandboxMatches++;
      for (const a of issue.assignees || []) {
        if (a && rosterSet.has(a.login)) {
          load.set(a.login, (load.get(a.login) || 0) + 1);
        }
      }
    }
  }

  console.log(`   Scanned ${scanned} issues, ${sandboxMatches} matched "[Sandbox]" prefix`);
  console.log(`   Lifetime load table:`);
  for (const login of roster) {
    console.log(`     ${login.padEnd(24)} ${load.get(login)}`);
  }
  return load;
}

function pickReviewers({ issue, roster, rosterIndex, load, dryRun }) {
  const rosterSet = new Set(roster);
  const currentAssignees = issue.assignees || [];
  const rosterOnIssue = currentAssignees.filter(a => rosterSet.has(a));
  const needed = Math.max(0, SLOTS_PER_ISSUE - rosterOnIssue.length);

  if (needed === 0) {
    console.log(`   ⏭️  #${issue.number}: already has ${rosterOnIssue.length} roster reviewer(s) [${rosterOnIssue.join(', ')}]; skipping`);
    return [];
  }

  const excluded = new Set(rosterOnIssue);
  if (issue.author && rosterSet.has(issue.author)) {
    excluded.add(issue.author);
    console.log(`   ℹ️  #${issue.number}: excluding author @${issue.author} from candidate pool`);
  }

  const candidates = roster
    .filter(login => !excluded.has(login))
    .map(login => ({ login, load: load.get(login) || 0, idx: rosterIndex.get(login) }))
    .sort((a, b) => a.load - b.load || a.idx - b.idx);

  const picks = candidates.slice(0, needed).map(c => c.login);
  const shortfall = needed - picks.length;
  if (shortfall > 0) {
    console.log(`   ⚠️  #${issue.number}: needed ${needed} pick(s) but only ${picks.length} eligible candidate(s) available`);
  }

  console.log(
    `   ${dryRun ? '🧪' : '🎯'} #${issue.number} "${issue.title}"\n` +
    `      current assignees: [${currentAssignees.join(', ') || '(none)'}]\n` +
    `      roster on issue:   [${rosterOnIssue.join(', ') || '(none)'}]\n` +
    `      needed:            ${needed}\n` +
    `      picking:           [${picks.join(', ')}]`
  );

  return picks;
}

async function assignReviewers(github, context, issueNumber, assignees) {
  const before = await github.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
  });
  const beforeLogins = (before.data.assignees || []).map(a => a.login);

  await github.rest.issues.addAssignees({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    assignees,
  });

  const after = await github.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
  });
  const afterLogins = (after.data.assignees || []).map(a => a.login);

  const added = afterLogins.filter(a => !beforeLogins.includes(a));
  const dropped = assignees.filter(a => !afterLogins.includes(a));
  console.log(`      ✅ #${issueNumber}: added [${added.join(', ') || '(none)'}]`);
  if (dropped.length > 0) {
    console.log(`      ⚠️  #${issueNumber}: GitHub silently dropped [${dropped.join(', ')}] — check they have access to ${context.repo.owner}/${context.repo.repo}`);
  }
  return { added, dropped };
}

async function assignUpcomingReviewers(github, context, { dryRun = false } = {}) {
  console.log(`🚀 Upcoming Auto-Assign`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Time: ${new Date().toISOString()}`);

  const roster = await loadRoster(github);
  const rosterIndex = new Map(roster.map((login, i) => [login, i]));

  const upcoming = await fetchUpcomingIssues(github);
  if (upcoming.length === 0) {
    console.log(`✅ Nothing to do`);
    return;
  }

  const load = await computeLifetimeLoad(github, context, roster);

  console.log(`\n📋 Planning assignments for ${upcoming.length} issue(s)`);
  let assignedCount = 0;
  let droppedTotal = 0;
  for (const issue of upcoming) {
    const picks = pickReviewers({ issue, roster, rosterIndex, load, dryRun });
    if (picks.length === 0) continue;

    for (const login of picks) {
      load.set(login, (load.get(login) || 0) + 1);
    }

    if (dryRun) continue;

    try {
      const { added, dropped } = await assignReviewers(github, context, issue.number, picks);
      assignedCount += added.length;
      droppedTotal += dropped.length;
    } catch (err) {
      console.log(`      ❌ #${issue.number}: assign failed: ${err.message}`);
      throw err;
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   Issues processed: ${upcoming.length}`);
  console.log(`   Assignees added:  ${assignedCount}`);
  if (droppedTotal > 0) {
    console.log(`   Silently dropped: ${droppedTotal} (see warnings above)`);
    throw new Error(`${droppedTotal} assignee(s) were silently dropped by GitHub — likely missing repo access`);
  }
  console.log(`✅ Done`);
}

module.exports = { assignUpcomingReviewers };
