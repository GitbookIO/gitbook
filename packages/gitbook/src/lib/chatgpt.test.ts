import { describe, expect, it } from 'bun:test';

import { isChatGPTRequest } from './chatgpt';

describe('ChatGPT request detection', () => {
    const requestWith = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

    it('detects ChatGPT requests', () => {
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'ChatGPT-User/1.0' }))).toBe(true);
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'ChatGPT Agent' }))).toBe(true);
        expect(
            isChatGPTRequest(
                requestWith({
                    'user-agent': 'SomeClient/1.0',
                    'signature-agent': '"https://chatgpt.com"',
                })
            )
        ).toBe(true);
    });

    it('does not match other agents', () => {
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'GPTBot/1.2' }))).toBe(false);
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'ClaudeBot/1.0' }))).toBe(false);
    });
});
