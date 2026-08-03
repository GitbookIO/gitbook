import { describe, expect, it } from 'bun:test';
import { isAITrainingOrIndexingRequest } from './indexing-crawlers';

describe('isAITrainingOrIndexingRequest', () => {
    it('detects the configured AI training and indexing crawlers on ask and search endpoints', () => {
        for (const [userAgent, parameter] of [
            ['Meta-ExternalAgent/1.1', 'ask'],
            ['meta-webindexer/1.0', 'q'],
            ['Amazonbot/0.1', 'ask'],
        ]) {
            expect(
                isAITrainingOrIndexingRequest(
                    new Request(`https://docs.example.com/page?${parameter}=query`, {
                        headers: { 'User-Agent': userAgent },
                    })
                )
            ).toBe(true);
        }
    });

    it('does not apply to regular pages or unlisted crawlers', () => {
        expect(
            isAITrainingOrIndexingRequest(
                new Request('https://docs.example.com/page', {
                    headers: { 'User-Agent': 'Meta-ExternalAgent/1.1' },
                })
            )
        ).toBe(false);
        expect(
            isAITrainingOrIndexingRequest(
                new Request('https://docs.example.com/page?ask=Question', {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    },
                })
            )
        ).toBe(false);
        expect(
            isAITrainingOrIndexingRequest(
                new Request('https://docs.example.com/page?ask=Question&q=query', {
                    headers: { 'User-Agent': 'GPTBot/1.2' },
                })
            )
        ).toBe(false);
    });
});
