import { describe, expect, it } from 'bun:test';

import { getContentTestURL } from './utils';

describe('Insights', () => {
    // The harness serves the site from BASE_URL while it is configured on gitbook.gitbook.io,
    // reproducing the split (apex vs www, alias, CDN) that turns an absolute URL cross-origin.
    const TEST_URL = getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open');

    it('should reference the insights endpoints relative to the served origin', async () => {
        const response = await fetch(TEST_URL);
        expect(response.status).toBe(200);

        const html = await response.text();

        for (const endpoint of ['__evt', 'visitor']) {
            expect(html).toContain(`~gitbook/${endpoint}`);
            expect(html).not.toMatch(new RegExp(`https?://[^"'\\\\\\s]*~gitbook/${endpoint}`));
        }
    });
});
