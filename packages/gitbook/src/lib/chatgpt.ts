/** Request markers for ChatGPT's server-side fetchers. */
export function isChatGPTRequest(request: Pick<Request, 'headers'>): boolean {
    const normalizedUserAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
    const normalizedSignatureAgent = request.headers.get('signature-agent')?.toLowerCase() ?? '';

    return (
        normalizedUserAgent.includes('chatgpt-user') ||
        normalizedUserAgent.includes('chatgpt agent') ||
        normalizedSignatureAgent.includes('chatgpt.com')
    );
}
