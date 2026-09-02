import { describe, expect, it } from 'bun:test';

import type { Revision, RevisionPageDocument, SiteSpace, Space } from '@gitbook/api';

import { resolveContentRef, resolveStringContentRef } from './references';
import type { GitBookAnyContext } from '@/lib/context';
import type { GitBookDataFetcher } from '@/lib/data';
import { createLinker } from '@/lib/links';

describe('resolveStringContentRef', () => {
    it.each([
        {
            label: 'an external URL',
            input: 'https://docs.gitbook.com/product-tour',
            expected: {
                kind: 'url',
                url: 'https://docs.gitbook.com/product-tour',
            },
        },
        {
            label: 'a page ref in the current space',
            input: '/pages/page_123',
            expected: {
                kind: 'page',
                page: 'page_123',
            },
        },
        {
            label: 'a page ref in another space',
            input: '/spaces/space-123/pages/page_123',
            expected: {
                kind: 'page',
                space: 'space-123',
                page: 'page_123',
            },
        },
        {
            label: 'an anchor in the current page',
            input: '#heading-1',
            expected: {
                kind: 'anchor',
                anchor: 'heading-1',
            },
        },
        {
            label: 'an anchor on a page in another space',
            input: '/spaces/space-123/pages/page-123#heading_1',
            expected: {
                kind: 'anchor',
                space: 'space-123',
                page: 'page-123',
                anchor: 'heading_1',
            },
        },
        {
            label: 'a file ref',
            input: '/spaces/space-123/files/file_123',
            expected: {
                kind: 'file',
                space: 'space-123',
                file: 'file_123',
            },
        },
        {
            label: 'a space ref',
            input: '/spaces/space-123',
            expected: {
                kind: 'space',
                space: 'space-123',
            },
        },
        {
            label: 'a collection ref',
            input: '/collections/collection-123',
            expected: {
                kind: 'collection',
                collection: 'collection-123',
            },
        },
        {
            label: 'a user ref',
            input: '/users/user_123',
            expected: {
                kind: 'user',
                user: 'user_123',
            },
        },
        {
            label: 'a reusable content ref',
            input: '/spaces/space-123/reusable-content/reusable_123',
            expected: {
                kind: 'reusable-content',
                space: 'space-123',
                reusableContent: 'reusable_123',
            },
        },
        {
            label: 'a tag ref',
            input: '/spaces/space-123/tags/tag_123',
            expected: {
                kind: 'tag',
                space: 'space-123',
                tag: 'tag_123',
            },
        },
        {
            label: 'an OpenAPI ref',
            input: '/openapi/spec-v1',
            expected: {
                kind: 'openapi',
                spec: 'spec-v1',
            },
        },
    ])('parses $label', ({ input, expected }) => {
        // @ts-expect-error
        expect(resolveStringContentRef(input)).toEqual(expected);
    });

    it.each([
        {
            label: 'a relative page path',
            input: 'getting-started',
        },
        {
            label: 'a page path with an extra segment',
            input: '/pages/page-123/child',
        },
        {
            label: 'a missing page identifier',
            input: '/pages/',
        },
        {
            label: 'a space path with a trailing slash',
            input: '/spaces/space-123/',
        },
        {
            label: 'an OpenAPI path with nested segments',
            input: '/openapi/spec/v1',
        },
    ])('returns null for $label', ({ input }) => {
        expect(resolveStringContentRef(input)).toBeNull();
    });
});

describe('resolveContentRef', () => {
    it("resolves a page in a different space using that space's page data, not the current context page", async () => {
        const sharedPageId = 'page-shared';

        const spaceAPage = {
            object: 'page',
            id: sharedPageId,
            type: 'document',
            kind: 'sheet',
            title: 'Space A Page',
            path: 'space-a-page',
            slug: 'space-a-page',
            pages: [],
            tags: [],
            layout: {},
            urls: { app: 'https://app.gitbook.com/page' },
        } as unknown as RevisionPageDocument;

        const spaceBPage = {
            object: 'page',
            id: sharedPageId,
            type: 'document',
            kind: 'sheet',
            title: 'Space B Page',
            path: 'space-b-page',
            slug: 'space-b-page',
            pages: [],
            tags: [],
            layout: {},
            urls: { app: 'https://app.gitbook.com/page' },
        } as unknown as RevisionPageDocument;

        const revisionA = {
            object: 'revision',
            id: 'rev-a',
            type: 'edits',
            pages: [spaceAPage],
            files: [],
            reusableContents: [],
            tags: [],
            parents: [],
            createdAt: '',
            urls: { app: '' },
        } as unknown as Revision;

        const revisionB = {
            object: 'revision',
            id: 'rev-b',
            type: 'edits',
            pages: [spaceBPage],
            files: [],
            reusableContents: [],
            tags: [],
            parents: [],
            createdAt: '',
            urls: { app: '' },
        } as unknown as Revision;

        const spaceA = {
            object: 'space',
            id: 'space-a',
            title: 'Space A',
            organization: 'org',
            revision: 'rev-a',
            urls: {
                location: 'https://api.gitbook.com/spaces/space-a',
                app: 'https://app.gitbook.com/o/org/s/space-a/',
                published: 'https://space-a.gitbook.io/',
            },
        } as unknown as Space;

        const spaceB = {
            object: 'space',
            id: 'space-b',
            title: 'Space B',
            organization: 'org',
            revision: 'rev-b',
            urls: {
                location: 'https://api.gitbook.com/spaces/space-b',
                app: 'https://app.gitbook.com/o/org/s/space-b/',
                published: 'https://space-b.gitbook.io/',
            },
        } as unknown as Space;

        const dataFetcher = {
            getSpace: async ({ spaceId }: { spaceId: string; shareKey: string | undefined }) => {
                if (spaceId === 'space-b') return { data: spaceB };
                return { error: { code: 404, message: 'Not found' } };
            },
            getRevision: async ({ spaceId }: { spaceId: string; revisionId: string }) => {
                if (spaceId === 'space-b') return { data: revisionB };
                return { error: { code: 404, message: 'Not found' } };
            },
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        const context: GitBookAnyContext = {
            dataFetcher,
            linker: createLinker({
                host: 'docs.example.com',
                spaceBasePath: '/space-a/',
                siteBasePath: '/',
            }),
            organizationId: 'org',
            space: spaceA,
            revision: revisionA,
            revisionId: 'rev-a',
            changeRequest: null,
            shareKey: undefined,
            // This page (from space A) has the same ID as the target page in space B.
            // It should NOT contaminate resolution in space B.
            page: spaceAPage,
        } as unknown as GitBookAnyContext;

        const result = await resolveContentRef(
            { kind: 'page', space: 'space-b', page: sharedPageId },
            context
        );

        expect(result?.text).toBe('Space B Page');
    });
});

describe('resolveContentRef for direct space links', () => {
    function buildSpace(id: string, title: string): Space {
        return {
            object: 'space',
            id,
            title,
            organization: 'org',
            revision: `rev-${id}`,
            urls: {
                location: `https://api.gitbook.com/spaces/${id}`,
                app: `https://app.gitbook.com/o/org/s/${id}/`,
                published: `https://${id}.gitbook.io/`,
            },
        } as unknown as Space;
    }

    function buildSiteSpace(space: Space, title: string): SiteSpace {
        return {
            object: 'site-space',
            id: `site-${space.id}`,
            path: '',
            space,
            title,
            draft: false,
            urls: { published: `https://site.gitbook.io/${space.id}/` },
        } as unknown as SiteSpace;
    }

    function buildContext(overrides: Record<string, unknown>): GitBookAnyContext {
        const currentSpace = buildSpace('space-current', 'Current Space');

        const dataFetcher = {
            getSpace: async () => ({ error: { code: 404, message: 'Not found' } }),
            getRevision: async () => ({ error: { code: 404, message: 'Not found' } }),
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        return {
            dataFetcher,
            linker: createLinker({
                host: 'docs.example.com',
                spaceBasePath: '/space-current/',
                siteBasePath: '/',
            }),
            organizationId: 'org',
            space: currentSpace,
            revision: {
                object: 'revision',
                id: 'rev-space-current',
                pages: [],
                files: [],
                reusableContents: [],
            },
            revisionId: 'rev-space-current',
            changeRequest: null,
            shareKey: undefined,
            site: { object: 'site', id: 'site-1' },
            ...overrides,
        } as unknown as GitBookAnyContext;
    }

    it('returns the site-space title with the section as a breadcrumb ancestor', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space Title');
        const siteSpace = buildSiteSpace(targetSpace, 'Variant Title');
        const section = {
            object: 'site-section',
            id: 'section-1',
            title: 'Reference',
            draft: false,
            path: '',
            siteSpaces: [siteSpace],
            urls: {},
        };

        const context = buildContext({
            siteSpace,
            sections: { list: [section], current: section },
            structure: { type: 'sections', structure: [section] },
        });

        const result = await resolveContentRef({ kind: 'space', space: 'space-current' }, context);

        expect(result?.text).toBe('Variant Title');
        expect(result?.ancestors).toEqual([{ label: 'Reference' }]);
        expect(result?.href).toBe(siteSpace.urls.published!);
        expect(result?.active).toBe(true);
    });

    it('returns the localized site-space title with a localized section breadcrumb', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space Title');
        const siteSpace = buildSiteSpace(targetSpace, 'Variant Title');
        const section = {
            object: 'site-section',
            id: 'section-1',
            title: 'Reference',
            localizedTitle: { fr: 'Référence' },
            draft: false,
            path: '',
            siteSpaces: [siteSpace],
            urls: {},
        };

        const contextFr = buildContext({
            siteSpace,
            sections: { list: [section], current: section },
            structure: { type: 'sections', structure: [section] },
            locale: 'fr',
        });

        const resultFr = await resolveContentRef(
            { kind: 'space', space: 'space-current' },
            contextFr
        );
        expect(resultFr?.text).toBe('Variant Title');
        expect(resultFr?.ancestors).toEqual([{ label: 'Référence' }]);

        const contextEn = buildContext({
            siteSpace,
            sections: { list: [section], current: section },
            structure: { type: 'sections', structure: [section] },
            locale: 'en',
        });

        const resultEn = await resolveContentRef(
            { kind: 'space', space: 'space-current' },
            contextEn
        );
        expect(resultEn?.text).toBe('Variant Title');
        expect(resultEn?.ancestors).toEqual([{ label: 'Reference' }]);
    });

    it('falls back to the site-space title when the site has no sections', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space Title');
        const siteSpace = buildSiteSpace(targetSpace, 'Variant Title');

        const context = buildContext({
            siteSpace,
            sections: null,
            structure: { type: 'siteSpaces', structure: [siteSpace] },
        });

        const result = await resolveContentRef({ kind: 'space', space: 'space-current' }, context);

        expect(result?.text).toBe('Variant Title');
    });

    it('falls back to the raw space title for an external/unmapped space', async () => {
        const externalSpace = buildSpace('space-external', 'External Space Title');

        const dataFetcher = {
            getSpace: async ({ spaceId }: { spaceId: string }) => {
                if (spaceId === 'space-external') return { data: externalSpace };
                return { error: { code: 404, message: 'Not found' } };
            },
            getRevision: async () => ({ error: { code: 404, message: 'Not found' } }),
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        const context = buildContext({
            siteSpace: buildSiteSpace(
                buildSpace('space-current', 'Current Space'),
                'Current Variant'
            ),
            sections: null,
            structure: { type: 'siteSpaces', structure: [] },
            dataFetcher,
        });

        const result = await resolveContentRef({ kind: 'space', space: 'space-external' }, context);

        expect(result?.text).toBe('External Space Title');
        expect(result?.href).toBe(externalSpace.urls.published!);
        expect(result?.active).toBe(false);
    });

    it('returns the target site-space title for a cross-space link within the same site section', async () => {
        const currentSpace = buildSpace('space-current', 'Practical Guides Hub');
        const guideSpace = buildSpace('space-guide', 'SNOMED CT EHR Requirements Guide');
        const currentSiteSpace = buildSiteSpace(currentSpace, 'Practical Guides');
        const guideSiteSpace = buildSiteSpace(guideSpace, 'SNOMED CT EHR Requirements Guide');
        guideSiteSpace.urls = {
            published: 'https://docs.example.com/guides/snomed-ct-ehr-requirements-guide/',
        };

        const section = {
            object: 'site-section',
            id: 'section-1',
            title: 'Practical Guides',
            draft: false,
            path: '',
            siteSpaces: [currentSiteSpace, guideSiteSpace],
            urls: {},
        };

        const dataFetcher = {
            getSpace: async () => ({ error: { code: 404, message: 'Not found' } }),
            getRevision: async () => ({ error: { code: 404, message: 'Not found' } }),
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        const context = buildContext({
            siteSpace: currentSiteSpace,
            sections: { list: [section], current: section },
            structure: { type: 'sections', structure: [section] },
            dataFetcher,
        });

        const result = await resolveContentRef({ kind: 'space', space: 'space-guide' }, context);

        expect(result?.text).toBe('SNOMED CT EHR Requirements Guide');
        expect(result?.ancestors).toEqual([{ label: 'Practical Guides' }]);
        expect(result?.href).toBe(guideSiteSpace.urls.published!);
        expect(result?.active).toBe(false);
    });

    function buildDocumentPage(
        id: string,
        title: string,
        path: string,
        pages: unknown[] = []
    ): RevisionPageDocument {
        return {
            object: 'page',
            id,
            type: 'document',
            kind: 'sheet',
            title,
            path,
            slug: path.split('/').pop() ?? path,
            pages,
            tags: [],
            layout: {},
            urls: { app: `https://app.gitbook.com/page/${id}` },
        } as unknown as RevisionPageDocument;
    }

    function buildRevision(pages: unknown[]): Revision {
        return {
            object: 'revision',
            id: 'rev-space-target',
            type: 'edits',
            pages,
            files: [],
            reusableContents: [],
            tags: [],
            parents: [],
            createdAt: '',
            urls: { app: '' },
        } as unknown as Revision;
    }

    function buildCrossSpaceContext(
        targetSpace: Space,
        targetRevision: Revision,
        structure: unknown
    ) {
        const currentSiteSpace = buildSiteSpace(
            buildSpace('space-current', 'Current Space'),
            'Current Variant'
        );
        const dataFetcher = {
            getSpace: async ({ spaceId }: { spaceId: string }) =>
                spaceId === targetSpace.id
                    ? { data: targetSpace }
                    : { error: { code: 404, message: 'Not found' } },
            getRevision: async ({ spaceId }: { spaceId: string }) =>
                spaceId === targetSpace.id
                    ? { data: targetRevision }
                    : { error: { code: 404, message: 'Not found' } },
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        return buildContext({
            siteSpace: currentSiteSpace,
            structure,
            dataFetcher,
        });
    }

    it('prepends every localized section group and section to cross-space page ancestors', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space');
        const targetSiteSpace = buildSiteSpace(targetSpace, 'Target Variant');
        targetSiteSpace.urls = { published: 'https://docs.example.com/target/' };
        const pageGroup = {
            object: 'page',
            id: 'page-group',
            type: 'group',
            kind: 'group',
            title: 'Getting started',
            path: 'getting-started',
            slug: 'getting-started',
            pages: [buildDocumentPage('page-target', 'Target page', 'getting-started/target')],
        };
        const section = {
            object: 'site-section',
            id: 'section-target',
            title: 'Reference',
            localizedTitle: { fr: 'Référence' },
            draft: false,
            path: 'reference',
            siteSpaces: [targetSiteSpace],
            urls: {},
        };
        const sectionGroup = {
            object: 'site-section-group',
            id: 'section-group-target',
            title: 'Product documentation',
            localizedTitle: { fr: 'Documentation produit' },
            draft: false,
            sections: [],
            children: [
                {
                    object: 'site-section-group',
                    id: 'section-group-nested',
                    title: 'API guides',
                    draft: false,
                    sections: [],
                    children: [
                        {
                            object: 'site-section-group',
                            id: 'section-group-child',
                            title: 'Authentication',
                            localizedTitle: { fr: 'Authentification' },
                            draft: false,
                            sections: [section],
                            children: [section],
                        },
                    ],
                },
            ],
        };
        const context = buildCrossSpaceContext(targetSpace, buildRevision([pageGroup]), {
            type: 'sections',
            structure: [sectionGroup],
        });

        const result = await resolveContentRef(
            { kind: 'page', space: targetSpace.id, page: 'page-target' },
            { ...context, locale: 'fr' } as GitBookAnyContext
        );

        expect(result?.text).toBe('Target page');
        expect(result?.ancestors).toEqual([
            { label: 'Documentation produit' },
            { label: 'API guides' },
            { label: 'Authentification' },
            { label: 'Référence', href: targetSiteSpace.urls.published },
            { label: 'Getting started', icon: null, href: expect.any(String) },
        ]);
        expect(result?.ancestors?.[0]?.href).toBeUndefined();
        expect(result?.ancestors?.[1]?.href).toBeUndefined();
        expect(result?.ancestors?.[2]?.href).toBeUndefined();
        expect(result?.ancestors?.[4]?.href).toBeTruthy();
    });

    it('uses the first document as the target for a page-group reference', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space');
        const targetSiteSpace = buildSiteSpace(targetSpace, 'Target Variant');
        targetSiteSpace.urls = { published: 'https://docs.example.com/target/' };
        const pageGroup = {
            object: 'page',
            id: 'page-group',
            type: 'group',
            kind: 'group',
            title: 'Learn about Cortex Agentix',
            path: 'cortex-agentix',
            slug: 'cortex-agentix',
            pages: [buildDocumentPage('page-target', 'Cortex Agentix docs', 'cortex-agentix/docs')],
        };
        const context = buildCrossSpaceContext(targetSpace, buildRevision([pageGroup]), {
            type: 'siteSpaces',
            structure: [targetSiteSpace],
        });

        const result = await resolveContentRef(
            { kind: 'page', space: targetSpace.id, page: 'page-group' },
            context
        );

        expect(result?.page?.id).toBe('page-target');
        expect(result?.text).toBe('Learn about Cortex Agentix');
        expect(result?.ancestors?.map((ancestor) => ancestor.label)).toEqual([
            'Target Variant',
            'Learn about Cortex Agentix',
        ]);
        expect(
            result?.ancestors?.filter(({ label }) => label === 'Learn about Cortex Agentix')
        ).toHaveLength(1);
    });

    it('uses the section instead of the variant for an ungrouped cross-space page', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space');
        const targetSiteSpace = buildSiteSpace(targetSpace, 'Target Variant');
        targetSiteSpace.urls = { published: 'https://docs.example.com/target/' };
        const section = {
            object: 'site-section',
            id: 'section-target',
            title: 'Reference',
            draft: false,
            path: 'reference',
            siteSpaces: [targetSiteSpace],
            urls: {},
        };
        const context = buildCrossSpaceContext(
            targetSpace,
            buildRevision([buildDocumentPage('page-target', 'Target page', 'target')]),
            { type: 'sections', structure: [section] }
        );

        const result = await resolveContentRef(
            { kind: 'page', space: targetSpace.id, page: 'page-target' },
            context
        );

        expect(result?.ancestors).toEqual([
            { label: 'Reference', href: targetSiteSpace.urls.published },
        ]);
    });

    it('falls back to the target variant for a sectionless in-site page', async () => {
        const targetSpace = buildSpace('space-target', 'Target Space');
        const targetSiteSpace = buildSiteSpace(targetSpace, 'Target Variant');
        targetSiteSpace.urls = { published: 'https://docs.example.com/target/' };
        const context = buildCrossSpaceContext(
            targetSpace,
            buildRevision([buildDocumentPage('page-target', 'Target page', 'target')]),
            { type: 'siteSpaces', structure: [targetSiteSpace] }
        );

        const result = await resolveContentRef(
            { kind: 'page', space: targetSpace.id, page: 'page-target' },
            context
        );

        expect(result?.ancestors).toEqual([
            { label: 'Target Variant', href: targetSiteSpace.urls.published },
        ]);
    });

    it('falls back to the raw space title for an external page', async () => {
        const targetSpace = buildSpace('space-external', 'External Space');
        const context = buildCrossSpaceContext(
            targetSpace,
            buildRevision([buildDocumentPage('page-target', 'External page', 'target')]),
            { type: 'siteSpaces', structure: [] }
        );

        const result = await resolveContentRef(
            { kind: 'page', space: targetSpace.id, page: 'page-target' },
            context
        );

        expect(result?.text).toBe('External page');
        expect(result?.ancestors).toEqual([
            { label: 'External Space', href: targetSpace.urls.published },
        ]);
    });
});
