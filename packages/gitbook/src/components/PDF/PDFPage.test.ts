import { describe, expect, it } from 'bun:test';

import { RevisionPageType } from '@gitbook/api';

import { createPDFLinker } from './linker';
import { createLinker, linkerWithAbsoluteURLs } from '@/lib/links';
import { getLinkerForSiteSpace } from '@/lib/sites';

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

function createPublishedLinker() {
    return linkerWithAbsoluteURLs(
        createLinker({
            protocol: 'https:',
            host: 'docs.vectra.ai',
            siteBasePath: '/deployment',
            spaceBasePath: '/deployment',
        })
    );
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
            host: 'open-2v.gitbook.com',
            siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
            spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
        });

        const linker = createPDFLinker(
            baseLinker,
            [{ page: createDocumentPage('included', '') }],
            createPublishedLinker()
        );

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

    it('preserves anchors for non-exported pages on the published domain', () => {
        const baseLinker = createLinker({
            host: 'open-2v.gitbook.com',
            siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
            spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
        });

        const linker = createPDFLinker(
            baseLinker,
            [{ page: createDocumentPage('included', '') }],
            createPublishedLinker()
        );

        expect(
            linker.toPathForPage({
                pages: [
                    createDocumentPage('included', ''),
                    createDocumentPage('outside', 'respond'),
                ],
                page: createDocumentPage('outside', 'respond'),
                anchor: 'faq',
            })
        ).toBe('https://docs.vectra.ai/deployment/respond#faq');
    });

    it('keeps the explicit path for the former first page with a custom home page', () => {
        const firstPage = createDocumentPage('first', 'getting-started');
        const includedPage = createDocumentPage('included', 'included');
        const publishedLinker = getLinkerForSiteSpace(
            createPublishedLinker(),
            { pageId: 'first' } as any,
            [firstPage, includedPage]
        );
        const linker = createPDFLinker(
            createLinker({
                host: 'open-2v.gitbook.com',
                siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
                spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
            }),
            [{ page: includedPage }],
            publishedLinker
        );

        expect(
            linker.toPathForPage({
                pages: [firstPage, includedPage],
                page: firstPage,
                anchor: 'intro',
            })
        ).toBe('https://docs.vectra.ai/deployment/getting-started#intro');
    });

    it('links the first page of an ordinary space to the published root', () => {
        const firstPage = createDocumentPage('first', '');
        const linker = createPDFLinker(
            createLinker({
                host: 'open-2v.gitbook.com',
                siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
                spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
            }),
            [{ page: createDocumentPage('included', 'included') }],
            createPublishedLinker()
        );

        expect(
            linker.toPathForPage({
                pages: [firstPage],
                page: firstPage,
            })
        ).toBe('https://docs.vectra.ai/deployment');
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

    it('falls back to an absolute base link when no published linker is provided', () => {
        const baseLinker = createLinker({
            host: 'open-2v.gitbook.com',
            siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
            spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf',
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
        ).toBe('https://open-2v.gitbook.com/~space/HJ1ltuWFvsArFWtevnRn~gitbook/pdf/respond');
    });
});
