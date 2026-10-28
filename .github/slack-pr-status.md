# Slack PR status

[GitbookIO/slack-pr-status](https://github.com/GitbookIO/slack-pr-status) adds review-status reactions to PR links posted in [#engineering](https://gitbook.slack.com/archives/C01NXGWJELS). It runs from `.github/workflows/slack-pr-status.yml` in `GitbookIO/gitbook`, `GitbookIO/gitbook-x` and `GitbookIO/integrations`. Emojis and statuses are configured in that workflow; see the action's README for the options.

Owner: Peter White.

| Configuration | Value |
| --- | --- |
| Slack app | **PR Status** (`A0C2AGLAD0T`), created from `.github/slack-pr-status-app-manifest.json` |
| Bot token | Repository Actions secret `SLAPR_SLACK_BOT_TOKEN` |
| GitHub token | The workflow's `GITHUB_TOKEN`, read-only |

Posts that link PRs from more than one repository are skipped, because each workflow's token can only read its own repository. PRs from forks get no reactions, because their workflows don't receive secrets.

To disable it in one repository, run `gh workflow disable slack-pr-status.yml --repo GitbookIO/<repository>`. To stop it everywhere, revoke the PR Status app's token.
