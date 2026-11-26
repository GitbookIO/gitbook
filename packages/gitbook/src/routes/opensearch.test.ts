import { describe, expect, it } from 'bun:test';

import { getOpenSearchURL, serveOpenSearchDescription } from './opensearch';
import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

describe('OpenSearch description', () => {
    const context = {
        site: { title: 'R&D <Docs>' },
        linker: createLinker({
            host: 'docs.company.com',
            siteBasePath: '/docs',
            spaceBasePath: '/docs/v1',
        }),
    } as GitBookSiteContext;

    it('is served from the site root for every variant', () => {
        expect(getOpenSearchURL(context)).toBe(
            'https://docs.company.com/docs/~gitbook/opensearch.xml'
        );
    });

    it('searches the site root and escapes the title', async () => {
        const response = serveOpenSearchDescription(context);

        expect(response.headers.get('content-type')).toBe(
            'application/opensearchdescription+xml; charset=utf-8'
        );
        const xml = await response.text();
        expect(xml).toContain('<ShortName>R&amp;D &lt;Docs&gt;</ShortName>');
        expect(xml).toContain('template="https://docs.company.com/docs?q={searchTerms}"');
    });
});
