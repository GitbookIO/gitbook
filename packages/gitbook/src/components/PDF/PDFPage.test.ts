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

function createGroupPage(id: string, path: string) {
    return {
        id,
        type: RevisionPageType.Group,
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

    it('includes anchors in in-document links for pages included in the PDF export', () => {
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
                anchor: 'section1',
            })
        ).toBe('#page-included-section1');
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

    it('returns a local placeholder link for group pages not included in the PDF export', () => {
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
                    createGroupPage('outside-group', 'outside'),
                ],
                page: createGroupPage('outside-group', 'outside'),
            })
        ).toBe('#');
    });
});
