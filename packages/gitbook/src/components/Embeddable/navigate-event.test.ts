import { describe, expect, it } from 'bun:test';

import type { RevisionPageDocument } from '@gitbook/api';

import { getEmbeddableDocsNavigateEvent } from './navigate-event';
import { getEmbeddableLinker } from '@/lib/embeddable-linker';
import { type GitBookLinker, createLinker } from '@/lib/links';

const pages = [
    { id: 'home', type: 'document', title: 'Home', path: 'home', pages: [] },
    { id: 'slack', type: 'document', title: 'Slack', path: 'integrations/slack', pages: [] },
] as unknown as RevisionPageDocument[];
const [home, slack] = pages as [RevisionPageDocument, RevisionPageDocument];

function embedLinker(servedOn: Parameters<typeof createLinker>[0]): GitBookLinker {
    return getEmbeddableLinker(createLinker(servedOn));
}

describe('getEmbeddableDocsNavigateEvent', () => {
    it('describes the page by its path from the site root and its published URL', () => {
        const linker = embedLinker({
            host: 'example.com',
            siteBasePath: '/docs/',
            spaceBasePath: '/docs/help-center/',
        });

        expect(getEmbeddableDocsNavigateEvent({ linker, pages, page: slack })).toEqual({
            tab: 'docs',
            path: '/help-center/integrations/slack',
            url: 'https://example.com/docs/help-center/integrations/slack',
            title: 'Slack',
        });
    });

    it('describes the first page of a space by the space root', () => {
        const linker = embedLinker({
            host: 'example.com',
            siteBasePath: '/docs/',
            spaceBasePath: '/docs/help-center/',
        });

        expect(getEmbeddableDocsNavigateEvent({ linker, pages, page: home })).toMatchObject({
            path: '/help-center',
            url: 'https://example.com/docs/help-center',
        });
    });

    it('describes the home page of a single-space site as the root', () => {
        const linker = embedLinker({ host: 'example.com', siteBasePath: '/', spaceBasePath: '/' });

        expect(getEmbeddableDocsNavigateEvent({ linker, pages, page: home })).toMatchObject({
            path: '/',
            url: 'https://example.com/',
        });
    });

    it('describes the home page of a site on a subdirectory as the root', () => {
        const linker = embedLinker({
            host: 'example.com',
            siteBasePath: '/docs/',
            spaceBasePath: '/docs/',
        });

        expect(getEmbeddableDocsNavigateEvent({ linker, pages, page: home })).toMatchObject({
            path: '/',
            url: 'https://example.com/docs',
        });
    });

    it('leaves out query parameters and anchors', () => {
        const base = embedLinker({ host: 'example.com', siteBasePath: '/', spaceBasePath: '/' });
        const linker: GitBookLinker = {
            ...base,
            toPathForPage: () => '/~gitbook/embed/page/integrations/slack?jwt_token=secret#setup',
        };

        expect(getEmbeddableDocsNavigateEvent({ linker, pages, page: slack })).toMatchObject({
            path: '/integrations/slack',
            url: 'https://example.com/integrations/slack',
        });
    });
});
