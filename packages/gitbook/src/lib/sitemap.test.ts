import { describe, expect, it } from 'bun:test';
import type { RevisionPage } from '@gitbook/api';

import { getIndexablePages } from './sitemap';

describe('getIndexablePages', () => {
    it('includes hidden pages when they remain indexable', () => {
        const pages: RevisionPage[] = [
            {
                id: 'visible-page',
                type: 'document',
                title: 'Visible page',
                path: 'visible-page',
                pages: [],
                hidden: false,
            },
            {
                id: 'hidden-page',
                type: 'document',
                title: 'Hidden page',
                path: 'hidden-page',
                pages: [],
                hidden: true,
            },
        ] as RevisionPage[];

        expect(getIndexablePages(pages).map(({ page }) => page.id)).toEqual([
            'visible-page',
            'hidden-page',
        ]);
    });

    it('excludes descendants of pages blocked from indexing', () => {
        const pages: RevisionPage[] = [
            {
                id: 'parent',
                type: 'group',
                title: 'Parent',
                path: 'parent',
                hidden: false,
                noRobotsIndex: true,
                pages: [
                    {
                        id: 'child',
                        type: 'document',
                        title: 'Child',
                        path: 'parent/child',
                        pages: [],
                        hidden: false,
                    },
                ],
            },
        ] as RevisionPage[];

        expect(getIndexablePages(pages)).toEqual([]);
    });

    it('includes documents nested under groups', () => {
        const pages: RevisionPage[] = [
            {
                id: 'outer-group',
                type: 'group',
                title: 'Outer group',
                path: 'outer-group',
                hidden: false,
                pages: [
                    {
                        id: 'inner-group',
                        type: 'group',
                        title: 'Inner group',
                        path: 'outer-group/inner-group',
                        hidden: false,
                        pages: [
                            {
                                id: 'nested-page',
                                type: 'document',
                                title: 'Nested page',
                                path: 'outer-group/inner-group/nested-page',
                                pages: [],
                                hidden: false,
                            },
                        ],
                    },
                ],
            },
        ] as RevisionPage[];

        expect(getIndexablePages(pages).map(({ page }) => page.id)).toEqual(['nested-page']);
    });
});
