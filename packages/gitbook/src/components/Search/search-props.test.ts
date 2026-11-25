import { describe, expect, it } from 'bun:test';

import { findSearchSection, getDirectSearchProps, type SearchSectionItem } from './search-props';
import type { GitBookSiteContext } from '@/lib/context';

describe('findSearchSection', () => {
    const sections: SearchSectionItem[] = [
        {
            id: 'guides',
            object: 'site-section-group',
            title: 'Guides',
            children: [
                {
                    id: 'getting-started',
                    object: 'site-section',
                    title: 'Getting started',
                    siteSpaceIds: ['getting-started-v1'],
                },
            ],
        },
    ];

    it('finds sections nested in groups', () => {
        expect(findSearchSection(sections, 'getting-started')).toEqual({
            id: 'getting-started',
            object: 'site-section',
            title: 'Getting started',
            siteSpaceIds: ['getting-started-v1'],
        });
    });

    it('returns undefined for an unknown section', () => {
        expect(findSearchSection(sections, 'api-reference')).toBeUndefined();
    });
});

describe('getDirectSearchProps', () => {
    function createContext(sameDomain?: boolean): GitBookSiteContext {
        const customization: Record<string, unknown> = {};
        if (sameDomain !== undefined) {
            customization.search = { sameDomain };
        }
        return {
            directSearch: {
                apiURL: 'https://api.gitbook.com',
                organizationId: 'org_1',
                siteId: 'site_1',
                proxyURL: '/docs/~gitbook/search-direct/orgs/org_1/sites/site_1',
                linker: {
                    urlMode: 'url-host',
                    siteHost: 'docs.example.com',
                    siteBasePath: '/docs/',
                    spaceBasePath: '/docs/api/',
                    gitbookURL: undefined,
                },
            },
            structure: { type: 'siteSpaces', structure: [] },
            linker: {
                toPathInSite: (path: string) => `/docs/${path}`,
            },
            customization,
        } as unknown as GitBookSiteContext;
    }

    it('sets sameDomain when enabled in site customization', () => {
        expect(getDirectSearchProps(createContext(true))?.sameDomain).toBe(true);
    });

    it('omits sameDomain when disabled or unset', () => {
        expect(getDirectSearchProps(createContext(false))?.sameDomain).toBeUndefined();
        expect(getDirectSearchProps(createContext())?.sameDomain).toBeUndefined();
    });
});
