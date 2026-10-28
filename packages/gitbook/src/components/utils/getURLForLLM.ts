import assertNever from 'assert-never';

/**
 * Returns the URL to open the page in a LLM with a pre-filled prompt.
 */
export function getURLForLLM(provider: 'chatgpt' | 'claude', prompt: string) {
    const encodedPrompt = encodeURIComponent(prompt);
    switch (provider) {
        case 'chatgpt':
            return `https://chat.openai.com/?q=${encodedPrompt}`;
        case 'claude':
            return `https://claude.ai/new?q=${encodedPrompt}`;
        default:
            assertNever(provider);
    }
}
