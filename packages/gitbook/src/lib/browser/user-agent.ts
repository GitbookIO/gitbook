/**
 * Common AI crawler/browser User-Agent patterns.
 * Used to hide cookie banners and other UI for AI-assisted browsing.
 *
 * @see https://platform.openai.com/docs/gptbot
 * @see https://platform.openai.com/docs/bots
 */
const AI_USER_AGENT_PATTERNS = [
    'ChatGPT-User',
    'GPTBot',
    'Claude-Web',
    'ClaudeBot',
    'Anthropic-AI',
    'Cohere-ai',
    'PerplexityBot',
    'Google-Extended',
    'Bytespider', // ByteDance
];

/**
 * Returns true if the current User-Agent appears to be an AI crawler or AI-assisted browser.
 * Used to hide cookie banners and avoid showing consent UI to non-human viewers.
 */
export function isAIUserAgent(): boolean {
    if (typeof navigator === 'undefined' || !navigator.userAgent) {
        return false;
    }
    const ua = navigator.userAgent;
    return AI_USER_AGENT_PATTERNS.some((pattern) => ua.includes(pattern));
}
