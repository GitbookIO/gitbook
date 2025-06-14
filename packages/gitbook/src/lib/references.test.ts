import { describe, expect, it, mock } from 'bun:test';
import * as api from '@gitbook/api';
import type { GitBookSpaceContext } from '@v2/lib/context';

import { resolveContentRef } from './references';

const NOW = new Date();

describe('resolveContentRef', () => {
    it('should resolve a relative page ref', async () => {
        const currentSpace = createMockSpace({ id: 'current-space' });
        const currentPages = [createMockPage({ id: 'page-1' })];
        const context = createMockContext({ space: currentSpace, pages: currentPages });

        const result = await resolveContentRef(
            {
                kind: 'page',
                page: 'page-1',
            },
            context
        );

        expect(result).not.toBeNull();
        expect(result?.text).toBe('Page 1');
        expect(result?.href).toBe('/page/page-1');
    });

    it('should resolve a url', async () => {
        const currentSpace = createMockSpace({ id: 'current-space' });
        const currentPages = [createMockPage({ id: 'page-1' })];
        const context = createMockContext({ space: currentSpace, pages: currentPages });

        const result = await resolveContentRef(
            {
                kind: 'url',
                url: 'https://example.com/some-page',
            },
            context
        );

        expect(result).not.toBeNull();
        expect(result?.text).toBe('https://example.com/some-page');
        expect(result?.href).toBe('https://example.com/some-page');
    });
});

describe('resolveContentRef with reusable content', () => {
    it('should resolve a relative page ref with reusable content', async () => {
        const rcSpace = createMockSpace({ id: 'rc-parent-space' });
        const context = createMockContext({ space: rcSpace, pages: [] });

        const result = await resolveContentRef(
            {
                kind: 'page',
                page: 'page-1',
            },
            context
        );

        expect(result).not.toBeNull();
        expect(result?.text).toBe('Current Page');
        expect(result?.href).toBe('/page/page-1');
    });
});

const createMockSpace = (space: MandateProps<Partial<api.Space>, 'id'>): api.Space => ({
    object: 'space',
    title: 'My Space',
    visibility: api.ContentVisibility.Public,
    urls: {
        location: `https://api.gitbook.com/s/${space.id}`,
        published: `https://example.com/space/${space.id}`,
        app: `https://app.gitbook.com/s/${space.id}`,
    },
    organization: 'org-1',
    revision: 'rev-1',
    emoji: '',
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    defaultLevel: 'inherit',
    comments: 0,
    changeRequests: 0,
    changeRequestsOpen: 0,
    changeRequestsDraft: 0,
    permissions: {
        view: true,
        access: true,
        admin: true,
        viewInviteLinks: true,
        edit: true,
        triggerGitSync: true,
        comment: true,
        merge: true,
        review: true,
    },
    ...space,
});

const createMockPage = (
    page: MandateProps<Partial<api.RevisionPageDocument>, 'id'>
): api.RevisionPageDocument => ({
    title: 'Page 1',
    slug: 'page-1',
    kind: 'sheet',
    type: 'document',
    layout: {},
    urls: {
        app: `https://app.gitbook.com/s/${page.id}/page-1`,
    },
    path: '/page-1',
    pages: [],
    document: {
        object: 'document',
        data: {},
        nodes: [],
    },
    ...page,
});

const createMockContext = (
    context: MandateProps<Partial<GitBookSpaceContext>, 'space' | 'pages'>
): GitBookSpaceContext => ({
    organizationId: 'org-1',
    changeRequest: null,
    revisionId: 'rev-1',
    shareKey: undefined,
    dataFetcher: {
        getSpace: mock().mockResolvedValue(null),
        getPublishedContentSite: mock().mockResolvedValue(null),
    } as any,
    linker: {
        toPathForPage: mock(({ page }: { page: api.RevisionPage }) => `/page/${page.id}`),
        toAbsoluteURL: mock((url: string) => `https://example.com${url}`),
    } as any,
    ...context,
});

/**
 * Type to make optional properties on a object mandatory.
 *
 * interface SomeObject {
 *   uid: string;
 *   price: number | null;
 *   location?: string;
 * }
 *
 * type ValuableObject = MandateProps<SomeObject, 'price' | 'location'>;
 */
type MandateProps<T extends {}, K extends keyof T> = T & {
    [MK in K]-?: NonNullable<T[MK]>;
};
