import { describe, expect, it } from 'bun:test';
import { RevisionPageType } from '@gitbook/api';

import { createLinker } from '@/lib/links';

import { createPDFLinker } from './linker';

function createDocumentPage(id: string, path: string) {
    return {
        id,
        type: RevisionPageType.Document,
        path,
        pages: [],
    } as any;
}

describe('createPDFLinker', () => {
    it('creates anchor links for pages included in the PDF export', () => {
        const linker = createPDFLinker(
            createLinker({
                host: 'docs.vectra.ai',
                siteBasePath: '/',
                spaceBasePath: '/deployment',
            }),
            [{ page: createDocumentPage('included', '') }]
        );

        expect(
            linker.toPathForPage({
                pages: [createDocumentPage('included', '')],
                page: createDocumentPage('included', ''),
            })
        ).toBe('#page-included');
    });

    it('keeps links to non-exported pages on the published domain', () => {
        const baseLinker = createLinker({
            host: 'docs.vectra.ai',
            siteBasePath: '/',
            spaceBasePath: '/deployment',
        });

        const linker = createPDFLinker(baseLinker, [{ page: createDocumentPage('included', '') }]);

        expect(
            linker.toPathForPage({
                pages: [
                    createDocumentPage('included', ''),
                    createDocumentPage('outside', 'respond'),
                ],
                page: createDocumentPage('outside', 'respond'),
            })
        ).toBe('https://docs.vectra.ai/deployment/respond');
    });
});
