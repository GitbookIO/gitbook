import { describe, expect, it } from 'bun:test';

import {
    type SiteExternalLink,
    type SiteSection,
    type SiteSectionGroup,
    TranslationLanguage,
} from '@gitbook/api';

import {
    type GitBookBaseContext,
    fetchSiteContextByIds,
    fetchSiteScopeContextByIds,
    fetchSpaceContextByIds,
    filterSectionsAndGroupsWithHiddenSiteSpaces,
    mergeSiteScopeAndSpaceContext,
} from './context';
import { createLinker } from './links';

function makeExternalLink(id: string): SiteExternalLink {
    return {
        object: 'site-external-link',
        id,
        title: 'GitBook',
        draft: false,
        url: 'https://www.gitbook.com',
    };
}

describe('filterSectionsAndGroupsWithHiddenSiteSpaces', () => {
    it('retains groups containing only external links', () => {
        const link = makeExternalLink('external');
        const group = {
            object: 'site-section-group',
            id: 'resources',
            children: [link],
        } as SiteSectionGroup;

        expect(filterSectionsAndGroupsWithHiddenSiteSpaces([group])).toEqual([group]);
    });

    it('filters hidden sections without mistaking links for sections', () => {
        const hiddenSection = {
            object: 'site-section',
            id: 'hidden',
            siteSpaces: [{ hidden: true }],
        } as SiteSection;
        const link = makeExternalLink('external');

        expect(filterSectionsAndGroupsWithHiddenSiteSpaces([hiddenSection, link])).toEqual([link]);
    });
});

const siteSpace = {
    object: 'site-space',
    id: 'site-space-id',
    title: 'Docs',
    space: { id: 'space-id', language: TranslationLanguage.Fr, revision: 'space-revision-id' },
    urls: {},
    draft: false,
};

const space = {
    id: 'space-id',
    organization: 'org-id',
    language: TranslationLanguage.En,
    revision: 'space-revision-id',
};
const revision = { id: 'revision-id', pages: [], tags: [] };

function getBaseContext(): GitBookBaseContext {
    const dataFetcher = {
        getPublishedContentSite: async () => ({
            data: {
                site: { id: 'site-id', title: 'Site', urls: {} },
                structure: { type: 'siteSpaces', structure: [siteSpace] },
                customizations: { site: {}, siteSpaces: { 'site-space-id': {} } },
                scripts: [],
            },
        }),
        getSpace: async () => ({ data: space }),
        getRevision: async () => ({ data: revision }),
    };

    return {
        dataFetcher,
        linker: createLinker({
            host: 'docs.example.com',
            siteBasePath: '/',
            spaceBasePath: '/',
        }),
    } as unknown as GitBookBaseContext;
}

const ids = {
    organization: 'org-id',
    site: 'site-id',
    siteSection: undefined,
    siteSpace: 'site-space-id',
    shareKey: undefined,
    isFallback: false,
    noIndexSearch: false,
    isLoggedInVisitor: false,
};

describe('fetchSiteScopeContextByIds', () => {
    it('resolves the site without reading the space or the revision', async () => {
        const context = await fetchSiteScopeContextByIds(getBaseContext(), {
            ...ids,
            revision: 'revision-id',
        });

        expect(context.site.id).toBe('site-id');
        expect(context.siteSpace.id).toBe('site-space-id');
        expect(context.revisionId).toBe('revision-id');
        // The language comes from the site structure, as the space itself is never fetched.
        expect(context.locale).toBe(TranslationLanguage.Fr);
        expect(context).not.toHaveProperty('space');
        expect(context).not.toHaveProperty('revision');
        expect(context).not.toHaveProperty('changeRequest');
    });
});

describe('fetchSiteContextByIds', () => {
    it('carries the same site data as the site scope, plus the space and the revision', async () => {
        const baseContext = getBaseContext();
        const [context, siteScopeContext] = await Promise.all([
            fetchSiteContextByIds(baseContext, {
                ...ids,
                space: 'space-id',
                changeRequest: undefined,
                revision: 'revision-id',
            }),
            fetchSiteScopeContextByIds(baseContext, { ...ids, revision: 'revision-id' }),
        ]);

        const { linker: _linker, ...siteScope } = siteScopeContext;
        expect(context).toMatchObject(siteScope);
        expect(context.space).toBe(space as unknown as typeof context.space);
        expect(context.revision).toBe(revision as unknown as typeof context.revision);
        expect(context.changeRequest).toBeNull();
    });

    it('falls back to the revision of the space when none is requested', async () => {
        const context = await fetchSiteContextByIds(getBaseContext(), {
            ...ids,
            space: 'space-id',
            changeRequest: undefined,
            revision: undefined,
        });

        expect(context.revisionId).toBe('space-revision-id');
    });
});

describe('mergeSiteScopeAndSpaceContext', () => {
    it('keeps the supplied data fetcher over the ones of both contexts', async () => {
        const siteBaseContext = getBaseContext();
        const spaceBaseContext = getBaseContext();
        const dataFetcher = getBaseContext().dataFetcher;
        const [siteScope, spaceContext] = await Promise.all([
            fetchSiteScopeContextByIds(siteBaseContext, { ...ids, revision: 'revision-id' }),
            fetchSpaceContextByIds(spaceBaseContext, {
                space: 'space-id',
                shareKey: undefined,
                changeRequest: undefined,
                revision: 'revision-id',
            }),
        ]);

        const context = mergeSiteScopeAndSpaceContext(siteScope, spaceContext, { dataFetcher });

        expect(context.dataFetcher).toBe(dataFetcher);
        expect(context.dataFetcher).not.toBe(siteBaseContext.dataFetcher);
        expect(context.dataFetcher).not.toBe(spaceBaseContext.dataFetcher);
        expect(context.site.id).toBe('site-id');
        expect(context.revision).toBe(revision as unknown as typeof context.revision);
        expect(context.revisionId).toBe('revision-id');
        expect(context.locale).toBe(TranslationLanguage.Fr);
    });
});
