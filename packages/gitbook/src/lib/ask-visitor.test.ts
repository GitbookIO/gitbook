import { describe, expect, it } from 'bun:test';

import { getAskForwardedHeaders, getAskVisitorAgent } from './ask-visitor';

describe('getAskVisitorAgent', () => {
    it('should read the User-Agent and Signature-Agent headers', () => {
        expect(
            getAskVisitorAgent(
                new Headers({
                    'user-agent': 'claude-code/2.0.0',
                    'signature-agent': '"https://chatgpt.com"',
                })
            )
        ).toEqual({ userAgent: 'claude-code/2.0.0', signatureAgent: '"https://chatgpt.com"' });
    });

    it('should omit missing or empty headers', () => {
        const agent = getAskVisitorAgent(new Headers({ 'user-agent': '' }));
        expect(agent).toEqual({});
        expect('userAgent' in agent).toBe(false);
    });

    it('should truncate overly long headers', () => {
        const agent = getAskVisitorAgent(new Headers({ 'user-agent': 'a'.repeat(2000) }));
        expect(agent.userAgent).toHaveLength(512);
    });
});

describe('getAskForwardedHeaders', () => {
    it('should forward the visitor agent in X-Original headers', () => {
        expect(
            getAskForwardedHeaders({
                userAgent: 'claude-code/2.0.0',
                signatureAgent: '"https://chatgpt.com"',
            })
        ).toEqual({
            'X-Original-User-Agent': 'claude-code/2.0.0',
            'X-Original-Signature-Agent': '"https://chatgpt.com"',
        });
    });

    it('should omit headers the visitor did not send', () => {
        expect(getAskForwardedHeaders({ userAgent: 'curl/8.7.1' })).toEqual({
            'X-Original-User-Agent': 'curl/8.7.1',
        });
        expect(getAskForwardedHeaders()).toEqual({});
    });
});
