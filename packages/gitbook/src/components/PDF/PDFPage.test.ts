import { describe, expect, it } from 'bun:test';

import { RevisionPageType } from '@gitbook/api';

import { createPDFLinker } from './linker';
import { selectPages } from './selectPages';
import {
    PDF_DEFAULT_LIMIT,
    PDF_SUBTREE_DEFAULT_LIMIT,
    getPDFSearchParams,
    getPDFURLSearchParams,
} from './urls';
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

function createDocumentPageWithChildren(id: string, children: any[]) {
    return { ...createDocumentPage(id, id), pages: children };
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

describe('createPDFLinker with batches', () => {
    const baseLinker = createLinker({
        host: 'open-2v.gitbook.com',
        siteBasePath: '/~space/HJ1ltuWFvsArFWtevnRn',
        spaceBasePath: '/~space/HJ1ltuWFvsArFWtevnRn',
    });
    const getBatchURL = (page: { id: string }) =>
        page.id === 'other-batch'
            ? 'https://open-2v.gitbook.com/~gitbook/pdf?offset=20'
            : undefined;

    it('prefers the published URL for documents exported in another batch', () => {
        const linker = createPDFLinker(
            baseLinker,
            [{ page: createDocumentPage('included', '') }],
            createPublishedLinker(),
            { getBatchURL }
        );

        expect(
            linker.toPathForPage({
                pages: [
                    createDocumentPage('included', ''),
                    createDocumentPage('other-batch', 'respond'),
                ],
                page: createDocumentPage('other-batch', 'respond'),
            })
        ).toBe('https://docs.vectra.ai/deployment/respond');
    });

    it('links to the batch containing a page when there is no published URL', () => {
        const linker = createPDFLinker(
            baseLinker,
            [{ page: createDocumentPage('included', '') }],
            undefined,
            { getBatchURL }
        );

        expect(
            linker.toPathForPage({
                pages: [createDocumentPage('other-batch', 'respond')],
                page: createDocumentPage('other-batch', 'respond'),
                anchor: 'faq',
            })
        ).toBe('https://open-2v.gitbook.com/~gitbook/pdf?offset=20#page-other-batch-faq');
    });

    it('links group pages to the batch containing them', () => {
        const linker = createPDFLinker(
            baseLinker,
            [{ page: createDocumentPage('included', '') }],
            createPublishedLinker(),
            { getBatchURL }
        );

        expect(
            linker.toPathForPage({
                pages: [createGroupPage('other-batch', 'group')],
                page: createGroupPage('other-batch', 'group'),
            })
        ).toBe('https://open-2v.gitbook.com/~gitbook/pdf?offset=20#page-other-batch');
    });
});

describe('getPDFSearchParams', () => {
    it('defaults to a small batch for subtree exports', () => {
        expect(getPDFSearchParams(new URLSearchParams('page=abc&only=yes'))).toEqual({
            page: 'abc',
            only: true,
            limit: PDF_SUBTREE_DEFAULT_LIMIT,
            offset: 0,
        });
        expect(PDF_SUBTREE_DEFAULT_LIMIT).toBe(20);
    });

    it('keeps the larger default for whole-space and single-page exports', () => {
        expect(getPDFSearchParams(new URLSearchParams('')).limit).toBe(PDF_DEFAULT_LIMIT);
        expect(getPDFSearchParams(new URLSearchParams('page=abc')).limit).toBe(PDF_DEFAULT_LIMIT);
        expect(PDF_DEFAULT_LIMIT).toBe(100);
    });

    it('parses an explicit limit and offset', () => {
        const params = getPDFSearchParams(
            new URLSearchParams('page=abc&only=yes&limit=5&offset=10')
        );
        expect(params.limit).toBe(5);
        expect(params.offset).toBe(10);
    });

    it('ignores invalid limit and offset values', () => {
        const params = getPDFSearchParams(
            new URLSearchParams('page=abc&only=yes&limit=nope&offset=-3')
        );
        expect(params.limit).toBe(PDF_SUBTREE_DEFAULT_LIMIT);
        expect(params.offset).toBe(0);
        expect(getPDFSearchParams(new URLSearchParams('limit=0&offset=1.5'))).toMatchObject({
            limit: PDF_DEFAULT_LIMIT,
            offset: 0,
        });
    });

    it('round-trips through getPDFURLSearchParams', () => {
        const params = { page: 'abc', only: true, limit: 20, offset: 40, back: 'false' };
        expect(getPDFSearchParams(getPDFURLSearchParams(params))).toEqual(params);
    });

    it('omits offset and limit when not set', () => {
        expect(getPDFURLSearchParams({ page: 'abc', only: true }).toString()).toBe(
            'page=abc&only=yes'
        );
    });
});

describe('selectPages', () => {
    const children = Array.from({ length: 45 }, (_, index) =>
        createDocumentPage(`child-${index}`, `child-${index}`)
    );
    const rootPages = [createDocumentPageWithChildren('root', children)];
    const ids = (pages: { page: { id: string } }[] | undefined) =>
        (pages ?? []).map(({ page }) => page.id);
    const childIds = (from: number, to: number) => children.slice(from, to).map((page) => page.id);

    it('renders the first batch of a subtree by default', () => {
        const selection = selectPages(
            rootPages,
            getPDFSearchParams(new URLSearchParams('page=root&only=yes'))
        );

        expect(selection?.total).toBe(46);
        expect(selection?.offset).toBe(0);
        expect(ids(selection?.pages)).toEqual(['root', ...childIds(0, 19)]);
        expect(selection?.allPages).toHaveLength(46);
    });

    it('slices the batch from offset to offset + limit', () => {
        const selection = selectPages(rootPages, {
            page: 'root',
            only: true,
            limit: 20,
            offset: 20,
        });

        expect(selection?.offset).toBe(20);
        expect(ids(selection?.pages)).toEqual(childIds(19, 39));
    });

    it('returns a shorter last batch', () => {
        const selection = selectPages(rootPages, {
            page: 'root',
            only: true,
            limit: 20,
            offset: 40,
        });

        expect(ids(selection?.pages)).toEqual(childIds(39, 45));
    });

    it('falls back to the last batch when offset is past the end', () => {
        const selection = selectPages(rootPages, {
            page: 'root',
            only: true,
            limit: 20,
            offset: 100,
        });

        expect(selection?.offset).toBe(26);
        expect(selection?.pages).toHaveLength(20);
    });

    it('only selects the page itself without only', () => {
        const selection = selectPages(rootPages, { page: 'root', limit: 100, offset: 0 });
        expect(ids(selection?.pages)).toEqual(['root']);
        expect(selection?.total).toBe(1);
    });

    it('returns null for an unknown page', () => {
        expect(selectPages(rootPages, { page: 'missing', limit: 100, offset: 0 })).toBeNull();
    });
});
