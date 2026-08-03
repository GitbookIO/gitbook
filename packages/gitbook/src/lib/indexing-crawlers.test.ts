import { describe, expect, it } from 'bun:test';
import { getSearchParamsForIndexingCrawler } from './indexing-crawlers';

describe('getSearchParamsForIndexingCrawler', () => {
    it('empties internal search parameters for indexing crawlers', () => {
        const searchParams = getSearchParamsForIndexingCrawler(
            new Request(
                'https://docs.example.com/page?ask=Question&q=query&goal=Read%20the%20docs',
                {
                    headers: { 'User-Agent': 'Meta-ExternalAgent/1.1' },
                }
            )
        );

        expect(searchParams.has('ask')).toBe(true);
        expect(searchParams.get('ask')).toBe('');
        expect(searchParams.has('q')).toBe(true);
        expect(searchParams.get('q')).toBe('');
        expect(searchParams.get('goal')).toBe('Read the docs');
    });

    it('preserves search parameters for unlisted crawlers', () => {
        const searchParams = getSearchParamsForIndexingCrawler(
            new Request('https://docs.example.com/page?ask=Question&q=query', {
                headers: { 'User-Agent': 'GPTBot/1.2' },
            })
        );

        expect(searchParams.get('ask')).toBe('Question');
        expect(searchParams.get('q')).toBe('query');
    });
});
