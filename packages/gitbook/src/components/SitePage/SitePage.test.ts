import { describe, expect, it } from 'bun:test';

import type { RevisionPageDocument } from '@gitbook/api';

import { getPageFullTitle } from './title';
import type { GitBookSiteContext } from '@/lib/context';

function makeContext(siteTitle: string, sectionTitle = ''): GitBookSiteContext {
    return {
        site: { title: siteTitle },
        visibleSections: sectionTitle
            ? {
                  current: { title: sectionTitle, default: false },
                  list: [{ object: 'site-section' }, { object: 'site-section' }],
              }
            : undefined,
        visibleSiteSpaces: [],
    } as unknown as GitBookSiteContext;
}

function makePage(title: string, tagTitle?: string): RevisionPageDocument {
    return { title, tagTitle } as unknown as RevisionPageDocument;
}

describe('getPageFullTitle', () => {
    it('uses tagTitle as the first segment', () => {
        expect(getPageFullTitle(makeContext('GitBook'), makePage('Page title', 'SEO title'))).toBe(
            'SEO title | GitBook'
        );
    });

    it('falls back to the page title when tagTitle is absent', () => {
        expect(getPageFullTitle(makeContext('GitBook'), makePage('Page title'))).toBe(
            'Page title | GitBook'
        );
    });

    it('deduplicates the section title against tagTitle', () => {
        expect(
            getPageFullTitle(makeContext('GitBook', 'Section'), makePage('Page title', 'Section'))
        ).toBe('Section | GitBook');
    });

    it('deduplicates the site title against tagTitle', () => {
        expect(
            getPageFullTitle(makeContext('SEO title'), makePage('Page title', 'SEO title'))
        ).toBe('SEO title');
    });
});
