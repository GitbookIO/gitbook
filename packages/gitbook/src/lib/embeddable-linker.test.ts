import { describe, expect, it } from 'bun:test';

import type { RevisionPageDocument } from '@gitbook/api';

import { getEmbeddableLinker } from './embeddable-linker';
import { createLinker, linkerWithDirectPagePaths } from './links';

describe('getEmbeddableLinker', () => {
    it('supports direct page paths inside the embed namespace', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/api/js',
            siteBasePath: '/',
        });
        const linker = linkerWithDirectPagePaths(getEmbeddableLinker(root));
        const pages = [{ id: 'intro', type: 'document', path: 'introduction', pages: [] }] as [
            RevisionPageDocument,
        ];

        expect(linker.toPathForPage({ pages, page: pages[0] })).toBe(
            '/api/js/~gitbook/embed/page/introduction'
        );
    });
});
