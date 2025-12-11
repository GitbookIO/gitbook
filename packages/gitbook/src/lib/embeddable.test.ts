import { describe, expect, it } from 'bun:test';
import { getEmbeddableLinker } from './embeddable';
import { createLinker } from './links';

describe('getEmbeddableLinker', () => {
    it('withOtherSiteSpace should resolve future links within the embed namespace', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        const otherSpaceEmbeddableLinker = embeddableLinker.withOtherSiteSpace({
            spaceBasePath: '/section/variant',
        });

        expect(otherSpaceEmbeddableLinker.toPathInSpace('some/path')).toBe(
            '/section/variant/~gitbook/embed/page/some/path'
        );
    });
});
