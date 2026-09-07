import { describe, expect, it } from 'bun:test';

import { isChatGPTRequest } from './chatgpt';
import { getMarkdownContentType } from './markdown-content-type';

describe('ChatGPT Markdown compatibility', () => {
    const requestWith = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

    it('detects ChatGPT requests without matching other agents', () => {
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
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'GPTBot/1.2' }))).toBe(false);
        expect(isChatGPTRequest(requestWith({ 'user-agent': 'ClaudeBot/1.0' }))).toBe(false);
    });

    it('uses plain text only for ChatGPT responses', () => {
        expect(getMarkdownContentType(true)).toBe('text/plain; charset=utf-8');
        expect(getMarkdownContentType(false)).toBe('text/markdown; charset=utf-8');
        expect(getMarkdownContentType()).toBe('text/markdown; charset=utf-8');
    });
});
