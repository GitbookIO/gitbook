import { describe, expect, it } from 'bun:test';

import type { SiteExternalLink, SiteSection, SiteSectionGroup } from '@gitbook/api';

import { filterSectionsAndGroupsWithHiddenSiteSpaces } from './context';

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
