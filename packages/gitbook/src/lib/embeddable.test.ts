import { describe, expect, it } from 'bun:test';
import { CustomizationDefaultThemeMode, type SiteCustomizationSettings } from '@gitbook/api';
import { resolveEmbeddableTheme } from './embeddable';
import { getEmbeddableLinker, toEmbeddableLinkForPublishedContent } from './embeddable-linker';
import { createLinker } from './links';

describe('getEmbeddableLinker', () => {
    it('withOtherSiteSpace should resolve future links within the embed namespace', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        const otherSpaceEmbeddableLinker = embeddableLinker.withOtherSiteSpace({
            spaceBasePath: '/section/variant',
        });

        expect(otherSpaceEmbeddableLinker.toPathInSpace('some/path')).toBe(
            '/section/variant/~gitbook/embed/page/some/path'
        );
    });

    it('toLinkForContent should keep current-space links inside the embed namespace', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/api/js',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        expect(
            embeddableLinker.toLinkForContent('https://docs.company.com/api/js/getting-started')
        ).toBe('/api/js/~gitbook/embed/page/getting-started');
    });

    it('toEmbeddableLinkForPublishedContent should insert the embed path before the page slug', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/api/js',
            siteBasePath: '/',
        });

        expect(
            toEmbeddableLinkForPublishedContent(
                root,
                'https://docs.company.com/api/python',
                'getting-started'
            )
        ).toBe('/api/python/~gitbook/embed/page/getting-started');
    });

    it('toEmbeddableLinkForPublishedContent should not duplicate the embed path for embeddable linkers', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/docs',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        expect(
            toEmbeddableLinkForPublishedContent(
                embeddableLinker,
                'https://docs.company.com/docs',
                'nested/page-path'
            )
        ).toBe('/docs/~gitbook/embed/page/nested/page-path');
    });

    it('toEmbeddableLinkForPublishedContent should place section paths before the embed path', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/docs',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        expect(
            toEmbeddableLinkForPublishedContent(
                embeddableLinker,
                'https://docs.company.com/docs/guides',
                ''
            )
        ).toBe('/docs/guides/~gitbook/embed/page');
    });

    it('toEmbeddableLinkForPublishedContent should keep page slugs after the embed path in other sections', () => {
        const root = createLinker({
            host: 'docs.company.com',
            spaceBasePath: '/docs',
            siteBasePath: '/',
        });

        const embeddableLinker = getEmbeddableLinker(root);

        expect(
            toEmbeddableLinkForPublishedContent(
                embeddableLinker,
                'https://docs.company.com/docs/guides',
                'getting-started'
            )
        ).toBe('/docs/guides/~gitbook/embed/page/getting-started');
    });
});

describe('resolveEmbeddableTheme', () => {
    function createCustomization(
        themes: SiteCustomizationSettings['themes']
    ): Pick<SiteCustomizationSettings, 'themes'> {
        return { themes };
    }

    it('follows the frame color scheme for multi-theme sites by default', () => {
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: true,
                    default: CustomizationDefaultThemeMode.Dark,
                })
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.System,
            defaultTheme: CustomizationDefaultThemeMode.System,
            forcedTheme: undefined,
        });
    });

    it('accepts an explicit override for multi-theme sites', () => {
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: true,
                    default: CustomizationDefaultThemeMode.Light,
                }),
                CustomizationDefaultThemeMode.Dark
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.Dark,
            defaultTheme: CustomizationDefaultThemeMode.Dark,
            forcedTheme: CustomizationDefaultThemeMode.Dark,
        });
    });

    it('keeps the site theme for single-theme sites without an override', () => {
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: false,
                    default: CustomizationDefaultThemeMode.Light,
                })
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.Light,
            defaultTheme: CustomizationDefaultThemeMode.Light,
            forcedTheme: CustomizationDefaultThemeMode.Light,
        });
    });

    it('honors an explicit override on single-theme sites (RND-11571)', () => {
        // A `?theme=light` embed on a site with the theme toggle disabled must still
        // force the requested scheme, since a webview can only pass it via the URL.
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: false,
                    default: CustomizationDefaultThemeMode.Dark,
                }),
                CustomizationDefaultThemeMode.Light
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.Light,
            defaultTheme: CustomizationDefaultThemeMode.Light,
            forcedTheme: CustomizationDefaultThemeMode.Light,
        });
    });

    it('does not force `system` for single-theme sites set to the system default', () => {
        // Forcing `system` makes next-themes' pre-paint script skip
        // prefers-color-scheme resolution, causing a light→dark flash (RND-11643).
        // It must stay unforced so next-themes resolves it before first paint.
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: false,
                    default: CustomizationDefaultThemeMode.System,
                })
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.System,
            defaultTheme: CustomizationDefaultThemeMode.System,
            forcedTheme: undefined,
        });
    });
});
