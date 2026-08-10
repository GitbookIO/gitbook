/**
 * Common AI crawler/browser User-Agent patterns.
 * Used to hide cookie banners and other UI for AI-assisted browsing.
 */
const AI_USER_AGENT_PATTERNS = [
    'GPTBot/1.0',
    'GPTBot/1.1',
    'GPTBot/1.2',
    'OAI-SearchBot/1.0',
    'ChatGPT-User/1.0',
    'ChatGPT-User/2.0',
    'ClaudeBot',
    'ClaudeBot/1.0',
    'claude-web',
    'claude-web/1.0',
    'Claude-SearchBot',
    'Claude/1.0',
    'Claude-User',
    'Anthropic-ai',
    'PerplexityBot',
    'Perplexity',
    'Perplexity-User',
    'ChatGLM-Spider/1.0',
    'Cohere-ai/1.0',
    'PhindBot/1.0',
    'PoeBot',
    'Tongyibot/1.0',
    'Yanbaobot/1.0',
    'DeepseekBot/1.0',
    'Deepseek/1.0',
    'DeepSeek Chat',
    'MetaAIbot',
    'Meta-externalagent',
    'Meta-ExternalFetcher',
    'Meta-llama',
    'Gemini-Deep-Research',
    'Gemini-User',
    'Deepseek-desktop',
    'GoogleAgent-Mariner',
    'NovaAct',
    'ChatGPT Agent',
    'Bedrock-bot',
    'Devin',
    'AI2bot',
    'Applebot-extended',
    'BytespiderBot',
    'CCBot',
    'Cotoyogi',
    'DuckAssistBot',
    'Google-extended',
    'Iaskspider',
    'iaskbot',
    'ICC-Crawler',
    'LinerBot',
    'MistralAI-User',
    'PanguBot',
];

let cachedIsAIUserAgent: boolean | undefined;

/**
 * Returns true if the current User-Agent appears to be an AI crawler or AI-assisted browser.
 * Used to hide cookie banners and avoid showing consent UI to non-human viewers.
 * The result is cached globally since the user-agent never changes during a session.
 */
export function isAIUserAgent(): boolean {
    if (cachedIsAIUserAgent !== undefined) {
        return cachedIsAIUserAgent;
    }
    if (typeof navigator === 'undefined' || !navigator.userAgent) {
        return false;
    }
    const ua = navigator.userAgent.toLowerCase();
    cachedIsAIUserAgent = AI_USER_AGENT_PATTERNS.some((pattern) =>
        ua.includes(pattern.toLowerCase())
    );
    return cachedIsAIUserAgent;
}
