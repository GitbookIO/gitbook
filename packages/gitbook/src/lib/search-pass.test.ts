import { describe, expect, it } from 'bun:test';

import {
    classifySearchPassStatus,
    isSearchPassEndpoint,
    readSearchPassFromPrewarmReply,
} from './search-pass';

const target = { apiURL: 'https://api.gitbook.com', organizationId: 'org_1', siteId: 'site_1' };

describe('isSearchPassEndpoint', () => {
    it('accepts only the search operation of the current site on the public API', () => {
        expect(
            isSearchPassEndpoint(
                'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search',
                target
            )
        ).toBe(true);

        for (const endpoint of [
            'https://evil.example.com/v1/orgs/org_1/sites/site_1/search',
            'http://api.gitbook.com/v1/orgs/org_1/sites/site_1/search',
            'https://api.gitbook.com.evil.example.com/v1/orgs/org_1/sites/site_1/search',
            'https://api.gitbook.com/v1/orgs/org_1/sites/site_2/search',
            'https://api.gitbook.com/v1/orgs/org_2/sites/site_1/search',
            'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search/../ask',
            'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/ask',
            'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search?redirect=1',
            'https://user@api.gitbook.com/v1/orgs/org_1/sites/site_1/search',
            '/v1/orgs/org_1/sites/site_1/search',
        ]) {
            expect(isSearchPassEndpoint(endpoint, target)).toBe(false);
        }
    });
});

describe('classifySearchPassStatus', () => {
    it('maps each API status to the browser action of the search pass contract', () => {
        expect(classifySearchPassStatus(200)).toEqual({ type: 'results' });
        expect(classifySearchPassStatus(401)).toEqual({ type: 'refresh' });
        expect(classifySearchPassStatus(403)).toEqual({ type: 'fall_back', reason: 'forbidden' });
        expect(classifySearchPassStatus(429)).toEqual({ type: 'back_off' });
        expect(classifySearchPassStatus(503)).toEqual({
            type: 'fall_back',
            reason: 'server_error',
        });
        expect(classifySearchPassStatus(404)).toEqual({
            type: 'fall_back',
            reason: 'unexpected_status',
        });
    });
});

describe('readSearchPassFromPrewarmReply', () => {
    it('finds a pass only in a well-formed searchPass field', () => {
        const searchPass = {
            token: 'pass',
            expiresAt: '2026-11-14T12:00:00.000Z',
            endpoint: 'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search',
        };
        expect(readSearchPassFromPrewarmReply({ searchPass })).toEqual(searchPass);

        for (const body of [
            {},
            null,
            '',
            { searchPass: null },
            { searchPass: { ...searchPass, token: '' } },
            { searchPass: { ...searchPass, expiresAt: 'soon' } },
            { searchPass: { token: 'pass', expiresAt: searchPass.expiresAt } },
            searchPass,
        ]) {
            expect(readSearchPassFromPrewarmReply(body)).toBeNull();
        }
    });
});
