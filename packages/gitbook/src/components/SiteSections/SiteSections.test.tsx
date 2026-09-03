import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { SiteExternalLink, SiteSection, SiteSectionGroup, SiteSpace } from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import { LinkContext } from '../primitives';
import { encodeClientSiteSections } from './encodeClientSiteSections';
import {
    hasMultipleSiteSections,
    shouldRenderSiteSectionNavigation,
} from './shouldRenderSiteSectionNavigation';
import { SiteSectionListItem } from './SiteSectionList';
import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

function makeExternalLink(id: string, overrides: Partial<SiteExternalLink> = {}): SiteExternalLink {
    return {
        object: 'site-external-link',
        id,
        title: 'GitBook',
        localizedTitle: { fr: 'GitBook FR' } as SiteExternalLink['localizedTitle'],
        description: 'Visit GitBook',
        localizedDescription: {
            fr: 'Visiter GitBook',
        } as SiteExternalLink['localizedDescription'],
        draft: false,
        url: 'https://www.gitbook.com',
        icon: 'link',
        ...overrides,
    };
}

function makeSection(): SiteSection {
    return {
        object: 'site-section',
        id: 'docs',
        title: 'Docs',
        draft: false,
        path: 'docs',
        siteSpaces: [{ id: 'space', default: true } as SiteSpace],
        urls: { published: 'https://docs.example.com/docs' },
    };
}

function makeContext(section: SiteSection): GitBookSiteContext {
    return {
        locale: TranslationLanguage.Fr,
        siteSpace: section.siteSpaces[0],
        linker: createLinker({
            host: 'docs.example.com',
            siteBasePath: '/',
            spaceBasePath: '/docs',
        }),
    } as GitBookSiteContext;
}

describe('encodeClientSiteSections', () => {
    it('encodes localized external links at the root and inside groups', () => {
        const section = makeSection();
        const rootLink = makeExternalLink('root');
        const nestedLink = makeExternalLink('nested', {
            title: 'Community',
            localizedTitle: { es: 'Comunidad' } as SiteExternalLink['localizedTitle'],
            description: undefined,
            localizedDescription: undefined,
            url: 'https://community.example.com',
        });
        const group = {
            object: 'site-section-group',
            id: 'resources',
            title: 'Resources',
            children: [nestedLink],
        } as SiteSectionGroup;

        expect(
            encodeClientSiteSections(makeContext(section), {
                list: [section, rootLink, group],
                current: section,
            }).list
        ).toEqual([
            {
                id: 'docs',
                title: 'Docs',
                description: undefined,
                icon: undefined,
                object: 'site-section',
                url: '/docs',
            },
            {
                id: 'root',
                title: 'GitBook FR',
                description: 'Visiter GitBook',
                icon: 'link',
                object: 'site-external-link',
                url: 'https://www.gitbook.com',
            },
            {
                id: 'resources',
                title: 'Resources',
                icon: undefined,
                object: 'site-section-group',
                children: [
                    {
                        id: 'nested',
                        title: 'Community',
                        description: undefined,
                        icon: 'link',
                        object: 'site-external-link',
                        url: 'https://community.example.com',
                    },
                ],
            },
        ]);
    });
});

describe('shouldRenderSiteSectionNavigation', () => {
    const section = makeSection();

    it('keeps an ordinary one-section site unchanged', () => {
        expect(
            shouldRenderSiteSectionNavigation({ list: [section], current: section })
        ).toBeFalse();
    });

    it('shows navigation for a section plus an external link', () => {
        expect(
            shouldRenderSiteSectionNavigation({
                list: [section, makeExternalLink('external')],
                current: section,
            })
        ).toBeTrue();
    });

    it('shows navigation for a link-containing group', () => {
        const group = {
            object: 'site-section-group',
            id: 'resources',
            children: [makeExternalLink('external')],
        } as SiteSectionGroup;

        expect(shouldRenderSiteSectionNavigation({ list: [group], current: section })).toBeTrue();
    });
});

describe('hasMultipleSiteSections', () => {
    const section = makeSection();

    it('ignores external links when determining the search scope', () => {
        expect(
            hasMultipleSiteSections({
                list: [section, makeExternalLink('external')],
                current: section,
            })
        ).toBeFalse();
    });

    it('counts content sections nested inside groups', () => {
        const secondSection = { ...makeSection(), id: 'guides' };
        const group = {
            object: 'site-section-group',
            id: 'resources',
            title: 'Resources',
            children: [section, makeExternalLink('external'), secondSection],
        } as SiteSectionGroup;

        expect(hasMultipleSiteSections({ list: [group], current: section })).toBeTrue();
    });
});

describe('external navigation anchors', () => {
    const item = {
        id: 'external',
        title: 'GitBook',
        description: 'Visit GitBook',
        object: 'site-external-link',
        url: 'https://www.gitbook.com',
    } as const;

    function renderItem(externalTarget: '_self' | '_blank') {
        return renderToStaticMarkup(
            <LinkContext.Provider value={{ externalTarget }}>
                <SiteSectionListItem item={item} isActive={false} />
            </LinkContext.Provider>
        );
    }

    it('uses the external target context and security relation', () => {
        expect(renderItem('_self')).not.toContain('target=');
        expect(renderItem('_blank')).toContain('target="_blank"');
        expect(renderItem('_blank')).toContain('rel="noopener noreferrer"');
    });

    it('stays external and never becomes active', () => {
        const markup = renderItem('_self');

        expect(markup).toContain('href="https://www.gitbook.com"');
        expect(markup).not.toContain('aria-current');
        expect(markup).not.toContain('data-active');
        expect(markup).not.toContain('prefetch');
    });
});
