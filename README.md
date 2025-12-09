# Sandbox

![CNCF Sandbox](https://raw.githubusercontent.com/cncf/artwork/main/other/cncf-sandbox/horizontal/color/cncf-sandbox-horizontal-color.png)

This repository is designed to allow projects seeking to join the CNCF as a :package: [Sandbox](https://github.com/cncf/toc/blob/main/process/README.md) :package: project to submit their applications. It is still a work in progress and we welcome PRs on this repo to automate assignments, improve the process, etc.  If you have any questions, please reach out in the [TOC Slack Channel](https://cloud-native.slack.com/archives/C0MP69YF4) or file an [issue](https://github.com/cncf/sandbox/issues/new) on the repo.

For information on the sandbox process please check out the [details on our sandbox application process below](#how-applications-are-reviewed).

> [!NOTE]  
> Projects which are primarily [Operators](https://www.cncf.io/blog/2022/06/15/kubernetes-operators-what-are-they-some-examples/) enabling another open source project to be Cloud Native should first contact that project about joining it as a subproject. If that isn't possible, please consider alternative foundations for membership as well, such as CommonHaus, SPI, or language based foundations such as the Rust Foundation.

## How to apply

Applying is as easy as 1-2-3!

1. Open a new [Sandbox Application](https://github.com/cncf/sandbox/issues/new?assignees=&labels=New&projects=&template=application.yml&title=%5BSandbox%5D+%3CProject+Name%3E) using the linked issue form.
1. Complete all sections of the form.
1. Submit the issue.

> [!CAUTION]
> The TOC MUST vote to approve your application and a Contribution Agreement MUST be signed before your project can be considered an official CNCF project. You can not represent your project as "donated" or "contributed" until those steps are completed. Please read more below.

## What's next?

Your project's application is placed in the backlog for triaging. You can view the status of your application and others at anytime by checking out our [Project Board](https://github.com/orgs/cncf/projects/14).

As we approach Sandbox application review meetings, CNCF staff will move applications to the "upcoming" column on the Project Board (number dependent on how many can be reviewed in a given meeting). At this point, each application's associated Technical Advisory Group (TAG) and the TOC will ask questions, seek to learn more, and provide a recommendation to the TOC for project inclusion. Projects which applied may also field questions from interested community members beyond any TAG and TOC questions.

### Community Comments on Applications

The TOC welcomes and appreciates community members support and exploration in surfacing items for technical consideration as part of sandbox applications, it allows the TOC to have a more comprehensive perspective on each projects' potential and supports our TAGs in understanding more about these projects.

In keeping with the [Technical Leadership Principles](https://github.com/cncf/toc/blob/main/PRINCIPLES.md#technical-leadership-principles), community members providing comments and questions should [be welcoming and curious in their comments](https://github.com/cncf/toc/blob/main/PRINCIPLES.md#be-welcoming), [provide feedback with courtesy](https://github.com/cncf/toc/blob/main/PRINCIPLES.md#provide-feedback-and-appreciation-appropriately), and [foster respectful resolution](https://github.com/cncf/toc/blob/main/PRINCIPLES.md#foster-respectful-resolution).  Embodying the technical leadership principles as you comment on these applications directly contributes to sustaining the open, community-oriented nature of CNCF.

### The TOC's sandbox review meeting

When the TOC meets to review applications, more details on [frequency here](#frequency), your application will be pulled up and discussed. Your application may receive one of several statuses:

* `New` - It is a brand new application and is in the backlog for an upcoming review.
* `Approved` - The application has been reviewed and been approved by the TOC. The issue will be closed.
* `Declined` - The application has been reviewed and been declined by the TOC. The comments on the issue will reflect the TOC decision and the issue will be closed.
* `Need-Info` - The application has been reviewed and requires more information in order for the TOC to further discuss the application.  For instructions on what to do, please jump down to [Need-Info](#need-info).
* `TAG-Assigned` - The application has been reviewed and the TOC would like a TAG to review or consult with the project prior to further discussions.  For instructions on what to do, please jump down to [TAG-Assigned](#tag-assigned).
* `Postponed` - The application has been reviewed and the TOC has determined the project (as it exists at time of review) is not ready for inclusion within the CNCF. For instructions on what to do, please jump down to [Postponed](#postponed)
* `Returning` - The application has been reviewed previously, was affixed a `Need-Info` or `TAG-Assigned` label, and that work has been completed and is ready for re-review.  For instructions on what to do, please jump down to [Returning](#returning).

### Label statuses defined

Removing, updating, and adding labels as well as updating the project board are the responsibility of the TOC and CNCF staff.

#### New

The application is new and placed in the backlog.

#### Approved

The application has been approved.

#### Declined

The application has been declined.

#### Need Info

If your project is assigned a `Need-Info` label, the TOC will comment on the issue with the specific additional information needed.  It will then be placed in the `Waiting` status of the [Project Board](https://github.com/orgs/cncf/projects/14).

Please provide the additional information requested as a comment on the issue with links as appropriate. Once you have done this, please add the below text to your comment so the TOC and staff know to update the issue:
`Completed info, project is Returning`

This lets the TOC know the project is ready to be reviewed again. A TOC member or staff will remove the `Need-Info` label and affix `Returning` where it will then be removed from the `Waiting` status and placed in the `Upcoming` status for discussion at the next meeting.

#### TAG Assigned

If your project is assigned an `TAG-Assigned` label, the TOC will comment which TAG(s) and provide specific details on what is requested. The TAG Co-Chair(s) will be tagged on the issue. Depending on the details of the comment, the TAG or the project will update the issue with a comment containing any pertinent information. This may include links to a presentation recording, as summary of a discussion with the TAG, or recommendations.

Once a comment has been added, please add the below text to your comment so the TOC and staff know to update the issue:
`Completed TAG review, project is Returning`

This lets the TOC know the project is ready to be reviewed again. A TOC member or staff will remove the `TAG-Assigned` label and affix `Returning` where it will then be removed from the `Waiting` status and placed in the `Upcoming` status for discussion at the next meeting.

##### TAG(s)

If the issue is affixed the `TAG-Assigned` label and you have been tagged on the issue as a TAG co-chair, please review the comments for the specific asks regarding the project. When completed, please provide a comment containing any pertinent information. This may include links to a presentation recording, as summary of a discussion with the TAG, or recommendations. Please work with the project to coorindate who will be updating the issue.

Once a comment has been added, please add the below text to your comment so the TOC and staff know to update the issue:
`Completed TAG review, project is Returning`

This lets the TOC know the project is ready to be reviewed again. A TOC member or staff will remove the `TAG-Assigned` label and affix `Returning` where it will then be removed from the `Waiting` status and placed in the `Upcoming` status for discussion at the next meeting.

#### Postponed

 If the issue has been affixed with the `Postponed` label it will be closed as the TOC has determined the project at the time of discussion is not ready for inclusion into the CNCF. There will be a comment on the issue that annotates the expectations in order for the project to be re-reviewed by the TOC. Depending on the status and details, there are a few options to be re-reviewed. For information on review ordering for postponed projects, plese refer to the [Review Order section](#review-order).

##### Returning for review after being postponed

a. If the project has had substantial changes to the original information provided, open a new issue and link to the previous issue in the `Additional information` question (last question on the form). The project will be reviewed as if it were a new project applying but retain the historical context of the previous review to assist in evaluation.

b1. If the project has had *no* substantial changes, the originator of the issue may reopen it and provide a brief status update that addresses the TOC closure comments with a comment `Revisit Ready`. The TOC or staff will apply the `Returning` label and place the issue in the `Upcoming` status for discussion at the next meeting.

b2. If the individual seeking to reopen the issue is NOT the originator of the issue AND the project has had no substantial changes, provide a brief status update that addresses the TOC closure comments. The TOC or staff will reopen the issue and apply the `Returning` label and place the issue in the `Upcoming` status for discussion at the next meeting.

#### Returning

Issues affixed with the `Returning` label are placed in the `Upcoming` status on the [Project Board](https://github.com/orgs/cncf/projects/14) for an updated discussion at the next Sandbox Application meeting.

## How applications are reviewed

### Frequency

The TOC reviews sandbox applications approximately **every two months** as of June 2020 in a non-public meeting; referred to as "session" hereafter.

### Quantity

The TOC attempts to work through approximately 7-10 applications per session. How many are actually reviewed in a session varies greatly between each session. Every project is unique and may warrant different areas of attention to be elevated for more in-depth discussion, depending on the nature and function of the project.

Each TOC member prepares for these sessions by performing an independent review of those projects scheduled for discussion at the next session prior to that session. They'll keep their notes on hand for when the project is up for discussion.

### Review order

Sandbox applications are traditionally reviewed in a First In, First Out (FIFO) ordering as they appear on the **🏗 Upcoming** Column of the [Sandbox Application Board](https://github.com/orgs/cncf/projects/14/views/1) by their corresponding issue number. The only exception is where projects are `Returning` for review. Projects that are `Returning` are prioritized for re-review as they had previously been subject to a review and have completed their outstanding asks. In cases where a project was `Postponed` and has substantial changes since last review, a new issue is opened, linked to the previous, and reviewed as a new application. Refer to the [Postponed label definition for more information](#postponed).

Applications are moved from `New` to `Upcoming` approximately two weeks prior to the next scheduled session by the TOC or support staff.

### Discussions and decision

During the course of the session, the TOC will actively discuss the project based on the information provided in the issue as well as other observations the TOC has about the project. Those observations vary greatly and may be subject to each TOC member's area of domain expertise, personal experience, community feedback, or other factors. During the course of active discussion, the TOC may identify areas the project needs to work on, complete, or allow to happen that could inhibit its acceptance into the CNCF. These areas will be captured succinctly and affixed the corresponding label ([see Label statuses defined](#label-statuses-defined) for more information). The issue will also receive a comment that details the additional areas that correspond with the label. The TOC comment may be formatted as a checklist or may be presented as text.

#### Examples

All project and organization names in the examples are fictional and are not intended to reflect any existing project past or present.

##### Baggywrinkle

The TOC reviews and discusses Baggywrinkle. The TOC determines Baggywrinkle doesn't have sufficiently clear direction or indicators on what the project does or how it does it. The TOC concurs that Baggywrinkle should present at the correct TAG to gather input to improve the clarity of what the project does and improve the documentation on how it does it in a cloud native way. The TOC will summarize the two items that need completed on the issue as checkbox items, affix the `Need-Info` and `TAG-Assigned` label. The TAG chairs are then tagged on the issue by their GitHub handle. The application is then moved to the **⏲ Waiting** Column of the [Sandbox Application Board](https://github.com/orgs/cncf/projects/14/views/1). Baggywrinkle then presents to the assigned TAG and incorporates their feedback into the project information and updates the application issue with a comment containing the requested clarity. They or the TAG may then check off the corresponding item, provide the `Completed TAG review & info, project is Returning` comment and the TOC or staff will remove the previous labels, affix the `Returning` label, and place the issue in the **🏗 Upcoming** Column of the [Sandbox Application Board](https://github.com/orgs/cncf/projects/14/views/1) so it is included at the next session.

##### Isobars

The TOC reviews and discusses Isobars. The TOC determines that Isobars is a *very* early project; having existed less than 6 months, and doesn't appear to clearly decoupled from the sponsoring company's flagship product. The TOC affixes the `Postponed` label and comments on the issue the need for greater maturity, more distinguished separation of the project from the product, and an estimated timeframe to reopen the issue for re-review. The issue is then closed. The project maintainers work for several months to decouple the project from the product and during that time the project fills out its documentation, use cases, and begins growing its community. The maintainers then reopen the issue, edit the content of the issue to reflect the changes or comment with updates and add the comment `Revisit Ready`. The TOC or staff will add the `Returning` label and remove the `Postponed` label. Isobars is then placed on the **🏗 Upcoming** Column of the [Sandbox Application Board](https://github.com/orgs/cncf/projects/14/views/1) by the TOC or staff so it is included at the next session.

## Acceptance

Once projects are accepted into the Sandbox, CNCF staff will open a project onboarding issue for the project based on [project onboarding template](https://github.com/cncf/sandbox/blob/main/.github/ISSUE_TEMPLATE/project-onboarding.md) - this may take a few days to get created. If you would like to start looking at the items on that list now, then you will be ready when for when the issue is opened.

---

## Automation

This repository includes GitHub Actions workflows to automate the sandbox onboarding process:

- **Vote Monitor:** Automatically creates onboarding issues when applications pass voting
- **Onboarding Progress Monitor:** Tracks onboarding progress and creates health issues in the TOC repository

For detailed documentation, see [Workflows README](.github/workflows/README.md).
