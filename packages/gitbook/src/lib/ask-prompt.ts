import { isAIEnabled } from '@/components/utils/isAIChatEnabled';
import type { GitBookSiteContext } from '@/lib/context';
import { linkerWithMarkdownPages } from '@/lib/links';

/**
 * Render the "Querying This Documentation" section of the agent instructions.
 * `pageUrl` is the URL of the current page, which the `ask` and `goal` parameters are appended to.
 */
export function renderQueryingDocumentation(options: { pageUrl: string }): string {
    const { pageUrl } = options;
    return `Perform an HTTP GET request on the following URL with the \`ask\` and \`goal\` query parameters:

\`\`\`
GET ${pageUrl}?ask=<question>&goal=<user_goal>
\`\`\`

\`ask\` is the immediate question: it should be specific, self-contained, and written in natural language.
\`goal\` is what the user is ultimately trying to achieve, the reason they need the answer. Sharing it helps GitBook give you a better, more relevant answer. A goal is most helpful when it describes the outcome the user wants rather than restating the question. For example, with \`ask=how do I create an API token\`, a goal like \`automate deployments from our CI pipeline\` lets GitBook tailor the answer to that use case.

The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.`;
}

const AGENT_INSTRUCTIONS_INTRO = `# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation`;

/**
 * Render the "Agent Instructions" of a markdown page (callers add the separator).
 */
export function renderPageAgentInstructions(options: { pageUrl: string }): string {
    return `${AGENT_INSTRUCTIONS_INTRO}
If you need additional information that is not directly available in this page, you can query the documentation by asking a question.

${renderQueryingDocumentation(options)}

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
`;
}

/**
 * Render the "Agent Instructions" of the site-wide llms.txt and llms-full.txt files.
 * Returns `undefined` when AI is disabled for the site.
 */
export function renderSiteAgentInstructions(context: GitBookSiteContext): string | undefined {
    if (!isAIEnabled(context.customization.ai.mode)) {
        return undefined;
    }

    // The ask endpoint ignores the page path, so the top-level `index.md` works on every site.
    const linker = linkerWithMarkdownPages(context.linker);
    const pageUrl = linker.toAbsoluteURL(linker.toPathForPagePath({ path: 'index' }));

    return `${AGENT_INSTRUCTIONS_INTRO}
This site has an agentic ask interface you may use to query the documentation dynamically by asking a question.

${renderQueryingDocumentation({ pageUrl })}
`;
}
