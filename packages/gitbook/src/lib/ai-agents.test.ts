import { describe, expect, it } from 'bun:test';

import { AI_AGENTS, getAIAgent, isAIAgentId } from './ai-agents';

describe('AI_AGENTS', () => {
    it('builds a deep link for each agent', () => {
        expect(AI_AGENTS.map((agent) => agent.getURL('hello'))).toEqual([
            'claude://code/new?q=hello',
            'codex://new?prompt=hello',
            'cursor://anysphere.cursor-deeplink/prompt?text=hello',
        ]);
    });

    it('encodes prompts so their content never leaks into the query string', () => {
        const prompt = 'Fix the bug in a/b.ts?\n#1 & be nice';

        for (const agent of AI_AGENTS) {
            const url = agent.getURL(prompt);
            // Everything past the single `=` is the encoded prompt, so the separators a prompt can
            // contain (`?`, `#`, `&`, newlines) can't be read as URL syntax.
            const [prefix, ...rest] = url.split('=');
            expect(rest).toHaveLength(1);
            expect(prefix).not.toContain(' ');
            expect(decodeURIComponent(rest.join(''))).toBe(prompt);
        }
    });
});

describe('isAIAgentId', () => {
    it('accepts known agents', () => {
        expect(isAIAgentId('claude')).toBe(true);
        expect(isAIAgentId('codex')).toBe(true);
        expect(isAIAgentId('cursor')).toBe(true);
    });

    it('rejects anything else', () => {
        expect(isAIAgentId('copy')).toBe(false);
        expect(isAIAgentId('chatgpt')).toBe(false);
        expect(isAIAgentId(undefined)).toBe(false);
        expect(isAIAgentId({ id: 'claude' })).toBe(false);
    });
});

describe('getAIAgent', () => {
    it('returns the agent for a known id', () => {
        expect(getAIAgent('cursor').label).toBe('Cursor');
    });
});
