# Slack PR reactions

[DataDog/slapr](https://github.com/DataDog/slapr) updates reactions on existing PR-link messages in [#engineering](https://gitbook.slack.com/archives/C01NXGWJELS). It runs in GitHub Actions. It does not post messages, approve or merge PRs, or change branch protection.

## Rollout and ownership

Owner: Peter White.

The rollout targets `GitbookIO/gitbook` (GBO), `GitbookIO/gitbook-x` (GBX), and `GitbookIO/integrations`. Each repository contains `.github/workflows/slapr.yml` and this runbook.

| Configuration | Value |
| --- | --- |
| Channel | `#engineering`, `C01NXGWJELS` |
| App manifest | `.github/slapr-app-manifest.json` |
| Slack app ID | `A0C2AGLAD0T` |
| Bot user ID | `U0C2AGP16R1`, repository variable `SLAPR_BOT_USER_ID` |
| Bot token | Repository Actions secret `SLAPR_SLACK_BOT_TOKEN` |
| Action | `DataDog/slapr@1c074e1dfd433f91a679d5113f7f8b956b65d973` |
| Approval threshold | Stock default, one approval |
| Events | `pull_request_review: submitted`, `pull_request: closed` |

## Install and configure

1. In [Slack app management](https://api.slack.com/apps), create the **PR Status** app from `.github/slapr-app-manifest.json` in the GitBook workspace. Obtain workspace approval if required, then install it. The bot requests Slapr's documented `channels:history`, `reactions:read`, and `reactions:write` scopes. `#engineering` is public, so `groups:history` is unnecessary. No review map is configured, so `channels:read` is unnecessary.
2. Invite **PR Status** only to `#engineering`. Keep it dedicated to Slapr: stock Slapr removes obsolete reactions belonging to this bot on a matched message. It leaves other users' reactions alone.
3. Record the app ID and bot user ID above. The bot profile's member ID or Slack `auth.test` response's `user_id` is the required bot user ID, not the app ID or bot ID.
4. Store the bot OAuth token as `SLAPR_SLACK_BOT_TOKEN` in each of the three repositories' Actions secrets. Use the GitHub secret UI or `gh secret set SLAPR_SLACK_BOT_TOKEN --repo GitbookIO/<repository>` and its hidden prompt. Never paste the token into a command argument, chat, workflow, or committed file. Alternatively, an organization secret must use selected-repository visibility limited to these three repositories.
5. Set Actions variable `SLAPR_BOT_USER_ID` in each repository to that bot's user ID. The token and user ID must belong to the same installation. Use `gh variable set SLAPR_BOT_USER_ID --repo GitbookIO/<repository> --body '<user-id>'` or the GitHub UI.
6. Merge the workflows through normal review, then run the live checks below. Repository maintainers handle reviews and merges; Slapr has only read access to GitHub contents and pull requests.

GBX runs this workflow on `blacksmith-2vcpu-ubuntu-2404`. GBO and integrations use `ubuntu-latest`, matching their existing workflows.

The workflow hardcodes the engineering channel and does not check out PR code. It uses the stock event triggers and leaves the approval threshold unset. There are no listeners, schedules, review maps, custom discovery, or additional services.

## Reactions

Slapr's status selection stays unchanged. Missing custom emoji names are mapped through the action's supported inputs to existing equivalents. Workspace lookup on 2026-09-17 confirmed `pr-approved` and `merged`; the other mappings are standard Slack emojis.

| Stock status | Reaction |
| --- | --- |
| Review started | `:eyes:` |
| Partially approved | `:next_track_button:` |
| Approved | `:pr-approved:` |
| Changes requested | `:construction:` |
| Merged | `:merged:` |
| Closed without merging | `:no_entry_sign:` |
| Comment-only review | `:speech_balloon:` |

The partially-approved reaction is configured but cannot occur with the default threshold of one approval. It becomes relevant only if that threshold is raised.

On approval, expect review-started and approved reactions. On merge, stock Slapr removes review-started and adds merged; it can retain approved alongside merged. Approval and merging have distinct reactions. Other stock review-state behavior is accepted.

## Live acceptance test

For each repository after credentials are configured and the workflow is on the default branch:

1. Open a fresh same-repository test PR through normal review. Post its full `https://github.com/GitbookIO/<repository>/pull/<number>` link as a new top-level message in `#engineering` before the review event.
2. Have another contributor approve it. Open the **Slack PR reactions** Actions run and verify that the matched message has the bot's `pr-approved` reaction.
3. Have an authorized maintainer merge it. Verify the closed-event run succeeds and the same message has the bot's `merged` reaction. No new Slack status message should appear.
4. Record the PR URL, Slack message permalink, approval/merge workflow run URLs, date, and result below. A green workflow alone does not prove the message was found or reacted to.

| Repository | PR and Slack message | Approval run/result | Merge run/result |
| --- | --- | --- | --- |
| GitbookIO/gitbook | Pending | Not tested | Not tested |
| GitbookIO/gitbook-x | Pending | Not tested | Not tested |
| GitbookIO/integrations | Pending | Not tested | Not tested |

Only the first matching message in Slapr's recent-history response is updated. Older messages, thread replies, duplicate posts, fork PRs, and links posted after the event are outside this rollout's acceptance criteria. Slapr does not paginate history or reconcile missed events.

## Troubleshoot and disable

- No workflow run: confirm the workflow is merged, Actions permits the pinned action, and the event was a submitted review or PR closure. These are the only configured triggers.
- `No message found requesting review`: confirm the full PR link was posted as a recent top-level message in `#engineering` before the event. This is a successful no-op in stock Slapr.
- `not_in_channel` or `channel_not_found`: check the app installation, channel ID, and bot membership in `#engineering`.
- `missing_scope`: compare the installed bot scopes with the manifest and reinstall after changes.
- `invalid_auth` or `account_inactive`: replace the repository secrets with the current bot token. If the bot identity changed, update `SLAPR_BOT_USER_ID` too.
- `invalid_name`: check the emoji mappings still exist. If a custom emoji was removed, map that input to another existing emoji, keeping approval and merged distinct.
- Old reactions remain or removal fails: confirm `SLAPR_BOT_USER_ID` is the member ID for the token's bot.
- GitHub permission errors: keep `contents: read` and `pull-requests: read`; do not introduce a PAT, write permissions, or `pull_request_target` to cover forks. Fork and Dependabot secret restrictions are accepted limitations.
- Rate limits or transient API failures: inspect the Actions log and retry the failed run after the limit resets. There is no scheduled reconciliation.

Disable one repository with `gh workflow disable slapr.yml --repo GitbookIO/<repository>`, or disable **Slack PR reactions** in its Actions UI. Repeat for all three to stop the integration. Revoke the Slack app token to stop its access immediately, remove its repository secrets, and remove the bot from `#engineering` when retiring it. Existing reactions remain.

## Pin review

On 2026-09-17, the pinned action definition, Dockerfile, entry point, dependency declarations, GitHub reads, Slack history lookup and reaction writes were inspected. Without `review-map`, the action targets only the supplied channel. It reads PR/review state and adds/removes reactions; it does not post Slack messages or write to GitHub.

The action SHA pins Slapr's source. Its upstream Dockerfile still uses the mutable `python:3.14` image and installs dependencies, including `pyyaml>=5.0`, at build time. This rollout keeps stock Slapr unchanged. Review upstream source and dependency changes before updating the SHA in all three repositories.
