import type { IconName } from '@gitbook/icons';

/**
 * A coding agent a prompt can be handed to.
 */
export interface AIAgent {
    id: string;
    label: string;
    icon: IconName;
    /** The agent's deep link, opening it with the prompt typed in but not sent. */
    getURL: (prompt: string) => string;
}

/**
 * Coding agents a prompt can be handed to, in the order menus offer them.
 *
 * Each link opens the agent installed on the visitor's machine, so the prompt never leaves their
 * computer. Each also caps how much it carries — around 14,000 characters for Claude, 8,000 for
 * Cursor.
 *
 * Claude Code's own `claude-cli://` scheme is deliberately absent: on macOS it launches by having
 * AppleScript *type* its command into a terminal, where the tty cuts the line at 1,024 bytes and
 * silently truncates the prompt. `claude://code/new` opens the same session inside the desktop app,
 * with no terminal in between.
 */
export const AI_AGENTS = [
    {
        id: 'claude',
        label: 'Claude',
        icon: 'claude',
        // https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link
        getURL: (prompt: string) => `claude://code/new?q=${encodeURIComponent(prompt)}`,
    },
    {
        id: 'codex',
        label: 'Codex',
        // No Codex icon in the library; the OpenAI mark it shares with ChatGPT stands in, as it
        // already does for the Codex MCP page action.
        icon: 'chatgpt',
        getURL: (prompt: string) => `codex://new?prompt=${encodeURIComponent(prompt)}`,
    },
    {
        id: 'cursor',
        label: 'Cursor',
        icon: 'cursor',
        // https://cursor.com/docs/integrations/deeplinks
        getURL: (prompt: string) =>
            `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(prompt)}`,
    },
] as const satisfies readonly AIAgent[];

export type AIAgentId = (typeof AI_AGENTS)[number]['id'];

/**
 * Find an agent by its identifier.
 */
export function getAIAgent(id: AIAgentId): (typeof AI_AGENTS)[number] {
    const agent = AI_AGENTS.find((agent) => agent.id === id);
    if (!agent) {
        throw new Error(`Unknown AI agent: ${id}`);
    }
    return agent;
}

/**
 * Check that a value is a known agent identifier, to validate persisted or external input.
 */
export function isAIAgentId(value: unknown): value is AIAgentId {
    return AI_AGENTS.some((agent) => agent.id === value);
}
