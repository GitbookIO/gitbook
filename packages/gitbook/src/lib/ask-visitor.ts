/**
 * Headers identifying who asked a question, forwarded so the API can classify the asker
 * (human, agent, bot) the same way it classifies insights events.
 */
export interface AskVisitorAgent {
    userAgent?: string;
    signatureAgent?: string;
}

// Bounds the header values, as they end up in the static route path of `?ask=`.
const MAX_HEADER_LENGTH = 512;

/**
 * Read the visitor's `User-Agent` and `Signature-Agent` from the request headers.
 * Missing headers are omitted rather than set to undefined, so the result can be rison-encoded.
 */
export function getAskVisitorAgent(headers: Pick<Headers, 'get'>): AskVisitorAgent {
    const userAgent = headers.get('user-agent')?.slice(0, MAX_HEADER_LENGTH);
    const signatureAgent = headers.get('signature-agent')?.slice(0, MAX_HEADER_LENGTH);

    return {
        ...(userAgent ? { userAgent } : {}),
        ...(signatureAgent ? { signatureAgent } : {}),
    };
}

/**
 * Request headers forwarding the visitor's agent on ask and Assistant API calls.
 * Our own `User-Agent` is left as is: the API relies on it to know the published site is calling.
 */
export function getAskForwardedHeaders(agent: AskVisitorAgent = {}): Record<string, string> {
    return {
        ...(agent.userAgent ? { 'X-Original-User-Agent': agent.userAgent } : {}),
        ...(agent.signatureAgent ? { 'X-Original-Signature-Agent': agent.signatureAgent } : {}),
    };
}
