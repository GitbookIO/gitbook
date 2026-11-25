import { describe, expect, it } from 'bun:test';

import { findSearchSection, type SearchSectionItem } from './search-props';

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
