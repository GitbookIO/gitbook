import { checkIsHttpURL } from '../urls';

/** Matches the `feedback` length accepted by `submitSiteAgentFeedback`. */
export const AGENT_FEEDBACK_MAX_LENGTH = 2048;

/** Matches the `AgentGoal` length accepted by `submitSiteAgentFeedback`. */
export const AGENT_FEEDBACK_GOAL_MAX_LENGTH = 1024;

/** Shared by every agent surface (MCP server, AI assistant) so findings arrive in one shape. */
export const agentFeedbackDescriptions = {
    finding: `Explain the issue in full, as if writing to a documentation maintainer who never saw this conversation. Describe what is wrong, where on the page it appears (quote the exact sentence or section title when possible), what the user was trying to do, and, when relevant, what the correct or expected information should be. Write a few clear, specific sentences in English. Never include personal or confidential information from the conversation. Up to ${AGENT_FEEDBACK_MAX_LENGTH} characters.`,

    goal: 'The broader end goal you were ultimately trying to accomplish (as/on behalf of the user) when you hit this issue. Gives the team the context you were working towards. Optional.',

    pageURL: (siteURL: string | undefined) =>
        `The full URL of the page the issue is about${siteURL ? ` (e.g. ${siteURL}/getting-started)` : ''}, so the finding is linked to the exact page.`,

    pageReference:
        'The URL of the page the issue is about, so the finding is linked to the exact page. Omit it to report about the page the user is currently viewing.',
};

/** Page a finding was recorded against, so callers can attribute an insights event to it. */
export type AgentFeedbackPage = {
    url: string;
    spaceId: string;
    pageId: string;
    revisionId: string;
};

export type AgentFeedbackResult =
    | { submitted: true; page: AgentFeedbackPage }
    | { submitted: false; error: string };

/** Normalize a page reference into an absolute HTTP URL, resolving relative ones against the site. */
export function parseAgentFeedbackPageURL(
    value: string,
    siteURL: string | undefined
): string | null {
    const candidate = URL.canParse(value)
        ? new URL(value)
        : siteURL && URL.canParse(value, siteURL)
          ? new URL(value, siteURL)
          : null;

    if (!candidate || !checkIsHttpURL(candidate)) {
        return null;
    }

    return candidate.toString();
}

/** Format a page as the content-ref string the assistant uses to reference pages. */
export function formatAgentFeedbackPageRef(page: { spaceId: string; pageId: string }): string {
    return `/spaces/${page.spaceId}/pages/${page.pageId}`;
}
