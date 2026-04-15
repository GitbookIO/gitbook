import { describe, expect, it } from 'bun:test';
import { CustomizationDefaultThemeMode, type SiteCustomizationSettings } from '@gitbook/api';
import { getEmbeddableLinker, resolveEmbeddableTheme } from './embeddable';
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

    it('keeps the site theme for single-theme sites', () => {
        expect(
            resolveEmbeddableTheme(
                createCustomization({
                    toggeable: false,
                    default: CustomizationDefaultThemeMode.Light,
                }),
                CustomizationDefaultThemeMode.Dark
            )
        ).toEqual({
            htmlTheme: CustomizationDefaultThemeMode.Light,
            defaultTheme: CustomizationDefaultThemeMode.Light,
            forcedTheme: CustomizationDefaultThemeMode.Light,
        });
    });
});
