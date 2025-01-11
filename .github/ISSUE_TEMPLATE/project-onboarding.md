---
name: Project onboarding for projects
about: Create a checklist of tasks for a project to complete the onboarding process
title: "[PROJECT ONBOARDING] project"
labels: project onboarding, sandbox
assignees: caniszczyk, idvoretskyi, jeefy, krook, mrbobbytables, RobertKielty
---

# Welcome to CNCF Project Onboarding

This is an issue created to help onboard your project into the CNCF after the TOC has voted to accept your project.

We would like your project to complete onboarding within **one** month of acceptance.

Please track your progress by using "Quote reply" to create your own copy of this checklist in an issue, so that you can update the status as you finish items.

## REQUIRED BEFORE PROCEEDING WITH ONBOARDING

A "Project Contribution Agreement" must be completed and any existing trademarks **MUST** be transferred to the Linux Foundation **BEFORE** further project onboarding tasks can be completed.

- [ ] Review and understand the [CNCF IP Policy](https://github.com/cncf/foundation/blob/main/charter.md#11-ip-policy).
- [ ] Review and understand the [trademark guidelines](https://www.linuxfoundation.org/legal/trademark-usage).
- [ ] Transfer any [trademark and logo assets to the Linux Foundation](https://github.com/cncf/foundation/tree/main/agreements) via the Contribution Agreement.

---

## Review and understand other documents

- [ ] The [Technical Leadership Principles](https://github.com/cncf/toc/blob/main/PRINCIPLES.md#technical-leadership-principles) that outlines the expected behavior for any maintainer in a leadership role.
- [ ] The [project proposal process and requirements](https://github.com/cncf/toc/blob/main/process/README.md).
- [ ] The [services available for your project at the CNCF](https://contribute.cncf.io/resources/project-services/).
- [ ] The [license allowlist](https://github.com/cncf/foundation/blob/main/allowed-third-party-license-policy.md#approved-licenses-for-allowlist).
- [ ] The [online program guidelines](https://github.com/cncf/foundation/blob/main/online-programs-guidelines.md).
- [ ] [Book time with CNCF staff](http://project-meetings.cncf.io) to understand project benefits and event resources.

## Contribute and transfer other materials

- [ ] Move your project to its own separate neutral GitHub organization. This will make it transferable to the CNCF's GitHub Enterprise account. If it's already in a GHE account, you will need to remove it from that first.
- [ ] Accept the invite to join the CNCF GitHub Enterprise account. We'll then add `thelinuxfoundation` as an organization owner to ensure neutral hosting of your project.
- [ ] Migrate your Slack channels (if any) to the [Kubernetes or CNCF Slack workspace](https://slack.com/help/articles/217872578-Import-data-from-one-Slack-workspace-to-another). CNCF staff can help.
- [ ] Join the [#maintainers-circle](https://app.slack.com/client/T08PSQ7BQ/C014YQ8CDCG) Slack channel.
- [ ] Transfer [your domain to the CNCF](https://jira.linuxfoundation.org/plugins/servlet/desk/portal/2/create/63?requestGroup=19). The "LF Stakeholder email" is <projects@cncf.io>.
- [ ] Submit a [pull request](https://github.com/cncf/artwork) with your artwork.
- [ ] Transfer website analytics to <projects@cncf.io>. CNCF staff can help.

## Update and document project details

- [ ] Ensure that [DCO](https://github.com/apps/dco) (preferred) or [CLA](https://github.com/cncf/cla) are enabled for all GitHub repositories of the project.
- [ ] Ensure that that the [CNCF Code of Conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md) (or your adopted version of it) are explicitly referenced at the project's `README` on GitHub.
- [ ] Ensure LF footer is on your website and [guidelines](https://github.com/cncf/foundation/blob/main/website-guidelines.md) are followed (if your project doesn't have a dedicated website, please adopt those guidelines for the `README` file).
- [ ] Create a maintainer list and add it to the [aggregated CNCF maintainer list](https://maintainers.cncf.io) via pull request.
- [ ] Provide emails for the maintainers to get access to the maintainers mailing list and Service Desk. Email them to <project-onboarding@cncf.io>.
- [ ] Start working on [written, open governance](https://contribute.cncf.io/maintainers/governance/).
- [ ] Start on an [OpenSSF Best Practices Badge](https://www.bestpractices.dev/en).

## CNCF staff tasks to support the project

- [ ] Add the project to [DevStats](https://devstats.cncf.io/).
- [ ] Add the project to [CLOmonitor](https://clomonitor.io/).
- [ ] Add the project to [LFX Insights](https://insights.lfx.linuxfoundation.org/). This is done by adding a read-only app to your GitHub organization once it's in CNCF GHE.
- [ ] Add the project to [LFX Project Control Center](https://projectadmin.lfx.linuxfoundation.org/project/a0941000002wBz4AAE).
- [ ] Add the project to the [Cloud Native Landscape](https://landscape.cncf.io) by updating [landscape.yml](https://github.com/cncf/landscape/blob/master/landscape.yml) following these [instructions](https://github.com/cncf/landscape2/blob/main/docs/config/data.yml).
- [ ] Add a license scanning tool, like [FOSSA](https://fossa.com/) or [Snyk](https://snyk.io/).
- [ ] Send a welcome email to confirm maintainer list access.
