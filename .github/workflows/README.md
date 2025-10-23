# CNCF Sandbox Automation Workflows

This directory contains GitHub Actions workflows for automating the CNCF Sandbox application and onboarding process.

## Workflows Overview

### 1. Vote Monitor (vote-monitor.yml)

Automatically creates onboarding issues when sandbox applications pass community voting.

**How It Works:**
1. **Trigger:** When `gitvote/passed` label is added to an application issue
2. **Action:** Creates a new onboarding issue using the project-onboarding.md template
3. **Result:** Comments on original application issue and closes it

**Files:**
- `.github/workflows/vote-monitor.yml` - Workflow definition
- `scripts/create-onboarding-issue.js` - Creation logic
- `.github/ISSUE_TEMPLATE/project-onboarding.md` - Onboarding template

**Testing:** Add the `gitvote/passed` label to any `[Sandbox] Project Name` issue.

---

### 2. Onboarding Progress Monitor (onboarding-monitor.yml)

Automated monitoring of sandbox project onboarding progress. Creates health issues in the TOC repository when projects approach the archival deadline.

---

## Quick Start (Onboarding Monitor)

**For Deployment:** Jump to [Deployment Steps](#deployment-steps)  
**For Troubleshooting:** See [Troubleshooting](#troubleshooting)

---

## Table of Contents

- [How It Works](#how-it-works)
- [Timeline](#timeline)
- [Issue Format Requirements](#issue-format-requirements)
- [Deployment Steps](#deployment-steps)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## How It Works

### What It Does

Monitors onboarding issues weekly and automatically:
- Applies progressive labels at 3, 6, 9, 10, and 12-month milestones
- Posts automated comments with reminders and warnings
- **Creates health issues in `cncf/toc` repository at 10 months**
- Tags TOC and projects team at key milestones
- Automatically archives projects at 12 months

### Workflow

```
Onboarding Issue Created
        ↓
   Weekly Monitoring
        ↓
   3 months: Label + Reminder
        ↓
   6 months: Label + Alert + Tag Team
        ↓
   9 months: Label + Warning + Tag Team
        ↓
  10 months: Label + CREATE HEALTH ISSUE IN cncf/toc
        ↓
  11 months: Weekly warnings (weeks 1-3), Daily warnings (week 4)
        ↓
  12 months: Archive + Close + Update health issue
```

### Schedule

**Runs:** Every Monday at 9:00 AM UTC  
**Triggers:** Automated schedule OR manual via workflow dispatch

### Processing Logic

1. Gets all open issues with labels: `project onboarding` AND `sandbox`
2. Validates each issue has title format: `[PROJECT ONBOARDING] {project name}`
3. Calculates how long the issue has been open
4. Applies appropriate labels and comments based on age
5. Creates health issues in `cncf/toc` at 10 months
6. Archives projects at 12 months

---

## Timeline

| Age | Label | Action |
|-----|-------|--------|
| **3 months** | `onboarding/incomplete` | Reminder comment |
| **6 months** | `onboarding/stale` | Alert + tag TOC/projects team |
| **9 months** | `onboarding/warning` | Warning + tag TOC/projects team |
| **10 months** | `onboarding/approaching-archival` | **Create health issue in cncf/toc** |
| **11 months** (weeks 1-3) | `onboarding/approaching-archival` | Weekly warnings |
| **11 months** (week 4) | `onboarding/approaching-archival` | Daily warnings |
| **12 months** | `onboarding/archived` | Close onboarding + update health issue |

### Timeline Extension Label

**Label:** `onboarding/extended`

Apply this label to onboarding issues where CNCF staff has granted a timeline extension. Issues with this label will be **completely skipped** by the workflow - no labels added, no comments posted, no health issues created.

**Use When:**
- Project has valid reason for delayed onboarding
- Extension agreed upon with CNCF staff
- Project needs more time beyond the standard 12-month timeline

**To Resume Monitoring:**
Remove the `onboarding/extended` label and the workflow will resume checking the issue on the next run.

### Health Issue Details

**Created:** At 10-month milestone  
**Location:** `cncf/toc` repository (NOT sandbox)  
**Template:** Matches [`project-health.yaml`](https://github.com/cncf/toc/blob/main/.github/ISSUE_TEMPLATE/project-health.yaml)  
**Labels:** `needs-triage`, `toc`, `kind/review`, `review/health`

**Contains:**
- Project name and onboarding issue link
- Full timeline and context
- Prior automated actions
- Suggested next steps for TOC

**Updated:** At 12 months when project is archived

---

## Issue Format Requirements

### ⚠️ Critical: Both Requirements Must Be Met

The workflow **ONLY** processes issues matching **BOTH** criteria:

#### 1. Title Format

```
[PROJECT ONBOARDING] {project name}
```

**Examples:**
- ✅ `[PROJECT ONBOARDING] Kubernetes Dashboard`
- ✅ `[PROJECT ONBOARDING] My Awesome Project`
- ❌ `[Onboarding] Project Name` (wrong prefix)
- ❌ `[project onboarding] Name` (must be ALL CAPS)

#### 2. Required Labels

- `project onboarding`
- `sandbox`

**Skipped Issues:**
Issues not matching both criteria are skipped with warning:
```
⚠️  Skipping issue #42 - title doesn't match [PROJECT ONBOARDING] format
```

---

## Deployment Steps

### Prerequisites

- Admin access to `cncf/sandbox` and `cncf/toc` repositories
- Ability to create Personal Access Tokens

### Step 1: Create GitHub Token

Create a **Fine-grained Personal Access Token**:

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure:
   - **Name:** `CNCF Sandbox Onboarding Monitor`
   - **Expiration:** 1 year
   - **Repository access:** `cncf/sandbox` AND `cncf/toc`
   - **Permissions:**
     - Issues: **Read and write**
     - Contents: **Read-only**
4. Generate and save the token

### Step 2: Add Secret

1. Go to: https://github.com/cncf/sandbox/settings/secrets/actions
2. New repository secret
3. Name: `ONBOARDING_MONITOR_TOKEN`
4. Value: Paste token from Step 1

### Step 3: Update Configuration

Edit `scripts/onboarding-progress-monitor.js` line 428:

```javascript
assignees: ['toc-member1', 'toc-member2', 'toc-member3']
```

### Step 4: Copy Files

```bash
# From sandbox-gha-tester to cncf/sandbox
cp .github/workflows/onboarding-monitor.yml cncf/sandbox/.github/workflows/
cp scripts/onboarding-progress-monitor.js cncf/sandbox/scripts/
```

### Step 5: Create Pull Request

```bash
cd cncf/sandbox
git checkout -b add-onboarding-monitor
git add .github/workflows/onboarding-monitor.yml scripts/onboarding-progress-monitor.js
git commit -m "Add onboarding progress monitoring automation"
git push origin add-onboarding-monitor
```

Create PR and request review.

### Step 6: Initial Run

After merge:

1. Go to: https://github.com/cncf/sandbox/actions/workflows/onboarding-monitor.yml
2. Click "Run workflow"
3. Set `check_all` to **`true`** (processes all existing issues)
4. Click "Run workflow"

### Step 7: Verify

Check:
- ✅ Workflow completed successfully
- ✅ Labels applied correctly
- ✅ Comments posted
- ✅ Health issues created in `cncf/toc`

---

## Configuration

### Update TOC Members

**File:** `scripts/onboarding-progress-monitor.js` line 428

```javascript
assignees: ['username1', 'username2']
```

### Change Schedule

**File:** `onboarding-monitor.yml`

```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

Change to:
- `'0 9 * * 3'` - Wednesdays
- `'0 12 * * 1'` - Mondays at noon
- `'0 9 * * 1,4'` - Mondays and Thursdays

### Adjust Timeline

**File:** `scripts/onboarding-progress-monitor.js`  
**Function:** `getProgressAction()`

Modify milestone thresholds (months):
- Archive: 12 months
- Health issue: 10 months
- Warning: 9 months
- Stale: 6 months
- Incomplete: 3 months

---

## Testing

### Test Health Issue Format

```bash
node scripts/test-health-issue-format.js
```

Expected: `✅ All tests passed!`

### Manual Workflow Run

1. Actions → Onboarding Progress Monitor
2. Run workflow
3. Set `check_all`:
   - `false` - Regular (skip processed)
   - `true` - Process all
4. Watch logs

### Check Logs

Look for:
```
📊 API Rate Limit: 4823/5000 remaining
Found 5 issues with onboarding labels
📋 Processing issue #42: "Test Project"
   Age: 10 months, 43 weeks, 305 days
   ✅ Created health issue #123 in cncf/toc
```

---

## Troubleshooting

### "Resource not accessible by integration"

**Fix:** Token needs `repo` scope for both repositories

### "Not Found" when creating health issue

**Fix:** Token needs access to `cncf/toc`

### No issues processed

**Check:**
- Issues have labels: `project onboarding` AND `sandbox`
- Title format: `[PROJECT ONBOARDING] {name}`
- Issues are open

### Rate limit exceeded

**Wait:** Limit resets automatically (shown in logs)

### Health issues not found during archival

**Check:** Project name extraction and health issue title format

---

## Maintenance

### Weekly (Automated)
- Workflow runs automatically
- Check logs for errors

### Monthly
- Review archived projects
- Check skipped issues
- Update TOC members if needed

### Annually
- **Renew token** before expiration
- Generate new token
- Update secret

---

## Quick Reference

| Item | Value |
|------|-------|
| **Deployment Target** | `cncf/sandbox` |
| **Health Issues Location** | `cncf/toc` |
| **Secret Name** | `ONBOARDING_MONITOR_TOKEN` |
| **Schedule** | Mondays 9 AM UTC |
| **Title Format** | `[PROJECT ONBOARDING] {name}` |
| **Labels** | `project onboarding`, `sandbox` |

---

## Files

**Workflow:** `onboarding-monitor.yml`  
**Script:** `scripts/onboarding-progress-monitor.js`  
**Test:** `scripts/test-health-issue-format.js`

---

## Links

- [CNCF Sandbox](https://github.com/cncf/sandbox)
- [CNCF TOC](https://github.com/cncf/toc)
- [Health Template](https://github.com/cncf/toc/blob/main/.github/ISSUE_TEMPLATE/project-health.yaml)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Version:** 1.0  
**Updated:** October 22, 2025  
**Status:** Ready for deployment
