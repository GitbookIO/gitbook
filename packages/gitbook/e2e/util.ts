import { argosScreenshot } from '@argos-ci/playwright';
import {
    CustomizationBackground,
    CustomizationCorners,
    CustomizationDefaultFont,
    type CustomizationHeaderItem,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationLinksStyle,
    CustomizationLocale,
    CustomizationSearchStyle,
    CustomizationSidebarBackgroundStyle,
    CustomizationSidebarListStyle,
    CustomizationTheme,
    CustomizationThemeMode,
    type CustomizationThemedColor,
    type SiteCustomizationSettings,
} from '@gitbook/api';
import { type BrowserContext, type Page, expect, test } from '@playwright/test';
import deepMerge from 'deepmerge';
import rison from 'rison';
import type { DeepPartial } from 'ts-essentials';

import { getContentTestURL, getTestURL } from '../tests/utils';

export interface Test {
    name: string;
    /**
     * URL to visit for testing.
     */
    url: string | (() => string | Promise<string>);
    cookies?: Parameters<BrowserContext['addCookies']>[0];
    /**
     * Test to run
     */
    run?: (page: Page) => Promise<unknown>;
    /**
     * Whether the test should be fullscreened during testing.
     */
    fullPage?: boolean;
    /**
     * Whether to take a screenshot of the test or set a threshold for the screenshot.
     */
    screenshot?:
        | false
        | {
              /**
               * Screenshot threshold.
               * From 0 to 1, where 0 is the most strict and 1 is the most permissive.
               * @default 0.5
               */
              threshold?: number;
              /**
               * Whether to wait for the table of contents to finish scrolling before taking the screenshot.
               */
              waitForTOCScrolling?: boolean;
          };
    /**
     * Whether to only run this test.
     */
    only?: boolean;
}

export type TestsCase = {
    name: string;
    tests: Array<Test>;
    contentBaseURL?: string;
};

export const allLocales: CustomizationLocale[] = [
    CustomizationLocale.Fr,
    CustomizationLocale.Es,
    CustomizationLocale.Ja,
    CustomizationLocale.Zh,
];

export const allThemeModes: CustomizationThemeMode[] = [
    CustomizationThemeMode.Light,
    CustomizationThemeMode.Dark,
];

export const allTintColors: Array<{
    label: string;
    value: CustomizationThemedColor | undefined;
}> = [
    {
        label: 'Off',
        value: undefined,
    },
    { label: 'Primary', value: { light: '#346DDB', dark: '#346DDB' } },
    { label: 'Custom', value: { light: '#C62C68', dark: '#EF96B8' } },
];

export const allThemes: CustomizationTheme[] = [
    CustomizationTheme.Clean,
    CustomizationTheme.Muted,
    CustomizationTheme.Bold,
    CustomizationTheme.Gradient,
];

export const allDeprecatedThemePresets: CustomizationHeaderPreset[] = [
    CustomizationHeaderPreset.Default,
    CustomizationHeaderPreset.Bold,
    CustomizationHeaderPreset.Contrast,
    CustomizationHeaderPreset.Custom,
];

export const allSidebarBackgroundStyles: CustomizationSidebarBackgroundStyle[] = [
    CustomizationSidebarBackgroundStyle.Default,
    CustomizationSidebarBackgroundStyle.Filled,
];

export const allSearchStyles: CustomizationSearchStyle[] = [
    CustomizationSearchStyle.Prominent,
    CustomizationSearchStyle.Subtle,
];

// Common customization settings

export const headerLinks: CustomizationHeaderItem[] = [
    {
        title: 'Secondary button',
        to: { kind: 'url', url: 'https://www.gitbook.com' },
        style: 'button-secondary',
        links: [],
    },
    {
        title: 'Primary button',
        to: { kind: 'url', url: 'https://www.gitbook.com' },
        style: 'button-primary',
        links: [],
    },
];

export async function waitForCookiesDialog(page: Page) {
    const dialog = page.getByTestId('cookies-dialog');
    await expect(dialog).toBeVisible();
}

/**
 * Transform test cases into Playwright tests and run it.
 */
export function runTestCases(testCases: TestsCase[]) {
    for (const testCase of testCases) {
        test.describe(testCase.name, () => {
            for (const testEntry of testCase.tests) {
                const testFn = testEntry.only ? test.only : test;
                testFn(testEntry.name, async ({ page, context }) => {
                    const testEntryPathname =
                        typeof testEntry.url === 'function' ? await testEntry.url() : testEntry.url;
                    const url = testCase.contentBaseURL
                        ? getContentTestURL(
                              new URL(testEntryPathname, testCase.contentBaseURL).toString()
                          )
                        : getTestURL(testEntryPathname);
                    if (testEntry.cookies) {
                        await context.addCookies(
                            testEntry.cookies.map((cookie) => ({
                                ...cookie,
                                domain: new URL(url).host,
                                path: '/',
                            }))
                        );
                    }

                    // Set the header to disable the Vercel toolbar
                    // But only on the main document as it'd cause CORS issues on other resources
                    await page.route('**/*', async (route, request) => {
                        if (request.resourceType() === 'document') {
                            await route.continue({
                                headers: {
                                    ...request.headers(),
                                    'x-vercel-skip-toolbar': '1',
                                },
                            });
                        } else {
                            await route.continue();
                        }
                    });

                    await page.goto(url);
                    if (testEntry.run) {
                        await testEntry.run(page);
                    }
                    const screenshotOptions = testEntry.screenshot;
                    if (screenshotOptions !== false) {
                        await argosScreenshot(page, `${testCase.name} - ${testEntry.name}`, {
                            viewports: ['macbook-16', 'macbook-13', 'ipad-2', 'iphone-x'],
                            argosCSS: `
                            /* Hide Intercom */
                            .intercom-lightweight-app {
                                display: none !important;
                            }
                            `,
                            threshold: screenshotOptions?.threshold ?? undefined,
                            fullPage: testEntry.fullPage ?? false,
                            beforeScreenshot: async ({ runStabilization }) => {
                                await runStabilization();
                                await waitForIcons(page);
                                await roundImageSizes(page);
                                if (screenshotOptions?.waitForTOCScrolling !== false) {
                                    await waitForTOCScrolling(page);
                                }
                            },
                            afterScreenshot: async () => {
                                await restoreImageSizes(page);
                            },
                        });
                    }
                });
            }
        });
    }
}

/**
 * Create a URL with customization settings.
 */
export function getCustomizationURL(partial: DeepPartial<SiteCustomizationSettings>): string {
    // We replicate the theme migration logic from the API to the tests, because the don't get these settings from the API.
    // We can remove this once the migration to the new themes have been completed and the new theme styles are verified
    // Map the theme preset (+ tint) to one of the new themes
    const newTheme = (() => {
        if (partial.styling?.theme) {
            return partial.styling.theme;
        }

        switch (partial.header?.preset) {
            case CustomizationHeaderPreset.Bold:
            case CustomizationHeaderPreset.Contrast:
            case CustomizationHeaderPreset.Custom:
                return CustomizationTheme.Bold;

            case CustomizationHeaderPreset.None:
            case CustomizationHeaderPreset.Default:
                if (partial.styling?.tint) {
                    return CustomizationTheme.Muted;
                }

                return CustomizationTheme.Clean;
            default:
                return CustomizationTheme.Clean;
        }
    })();

    /**
     * Default customization settings.
     *
     * The customization object passed to the URL should be a valid API settings object. Hence we extend the test with necessary defaults.
     */
    const DEFAULT_CUSTOMIZATION: SiteCustomizationSettings = {
        styling: {
            theme: newTheme,
            primaryColor: { light: '#346DDB', dark: '#346DDB' },
            infoColor: { light: '#787878', dark: '#787878' },
            warningColor: { light: '#FE9A00', dark: '#FE9A00' },
            dangerColor: { light: '#FB2C36', dark: '#FB2C36' },
            successColor: { light: '#00C950', dark: '#00C950' },
            corners: CustomizationCorners.Rounded,
            font: CustomizationDefaultFont.Inter,
            background: CustomizationBackground.Plain,
            icons: CustomizationIconsStyle.Regular,
            links: CustomizationLinksStyle.Default,
            sidebar: {
                background: CustomizationSidebarBackgroundStyle.Default,
                list: CustomizationSidebarListStyle.Default,
            },
            search: CustomizationSearchStyle.Subtle,
        },
        internationalization: {
            locale: CustomizationLocale.En,
        },
        favicon: {},
        header: {
            preset: CustomizationHeaderPreset.Default,
            links: [],
        },
        footer: {
            groups: [],
        },
        themes: {
            default: CustomizationThemeMode.Light,
            toggeable: true,
        },
        pdf: {
            enabled: true,
        },
        feedback: {
            enabled: false,
        },
        aiSearch: {
            enabled: true,
        },
        advancedCustomization: {
            enabled: true,
        },
        git: {
            showEditLink: false,
        },
        pagination: {
            enabled: true,
        },
        trademark: {
            enabled: true,
        },
        privacyPolicy: {
            url: 'https://www.gitbook.com/privacy',
        },
        socialPreview: {},
    };

    const encoded = rison.encode_object(deepMerge(DEFAULT_CUSTOMIZATION, partial));

    const searchParams = new URLSearchParams();
    searchParams.set('customization', encoded);

    return `?${searchParams.toString()}`;
}

/**
 * Wait for all icons present on the page to be loaded.
 */
async function waitForIcons(page: Page) {
    await page.waitForFunction(async () => {
        function loadImage(src: string) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.decode().then(resolve, reject);
            });
        }

        const icons = Array.from(document.querySelectorAll('svg.gb-icon'));
        await Promise.all(
            icons.map(async (icon) => {
                // Only load the icon if it's visible.
                if (!icon.checkVisibility()) {
                    return;
                }
                // url("https://ka-p.fontawesome.com/releases/v6.6.0/svgs/light/moon.svg?v=2&token=a463935e93")
                const maskImage = window.getComputedStyle(icon).getPropertyValue('mask-image');
                const urlMatch = maskImage.match(/url\("([^"]+)"\)/);
                const url = urlMatch ? urlMatch[1] : null;
                if (!url) {
                    throw new Error('No mask-image');
                }
                await loadImage(url);
                // Wait for two frames to make sure the icon is loaded.
                await new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            resolve(true);
                        });
                    });
                });
            })
        );
    });
}

/**
 * Take all images, measure them and set their width and height to rounded values.
 */
async function roundImageSizes(page: Page) {
    await page.waitForFunction(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        await Promise.all(
            images.map(async (img) => {
                return new Promise<void>((resolve) => {
                    const setDimensions = () => {
                        // Mark it as stabilized
                        img.dataset.stabilized = 'true';

                        // Preserve the original width and height
                        img.dataset.originalWidth = img.style.width ?? '';
                        img.dataset.originalHeight = img.style.height ?? '';

                        // Set the width and height to the rounded values
                        const rect = img.getBoundingClientRect();
                        img.style.width = `${Math.round(rect.width)}px`;
                        img.style.height = `${Math.round(rect.height)}px`;

                        resolve();
                    };

                    // Force the re-rendering of the image by removing the src and srcset attributes
                    // and then restoring them.
                    // This will recalculate the dimensions of the image and make it right.
                    const originalSrcSet = img.srcset;
                    const originalSrc = img.src;
                    img.srcset = '';
                    img.src = '';
                    img.srcset = originalSrcSet;
                    img.src = originalSrc;

                    if (img.complete) {
                        setDimensions();
                    } else {
                        const cleanup = () => {
                            img.removeEventListener('load', handleLoad);
                            img.removeEventListener('error', handleError);
                        };
                        const handleError = () => {
                            cleanup();
                            resolve();
                        };
                        const handleLoad = () => {
                            cleanup();
                            setDimensions();
                        };
                        img.addEventListener('load', handleLoad);
                        img.addEventListener('error', handleError);
                    }
                });
            })
        );
        return true;
    });
}

/**
 * Restore images to their original size.
 */
async function restoreImageSizes(page: Page) {
    await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img[data-stabilized]'));
        images.forEach((img) => {
            if (img instanceof HTMLImageElement) {
                img.style.width = img.dataset.originalWidth ?? '';
                img.style.height = img.dataset.originalHeight ?? '';
                delete img.dataset.originalWidth;
                delete img.dataset.originalHeight;
                delete img.dataset.stabilized;
            }
        });
    });
}

/**
 * Wait for TOC to be correctly scrolled into view.
 */
async function waitForTOCScrolling(page: Page) {
    const viewport = await page.viewportSize();
    if (viewport && viewport.width >= 1024) {
        const toc = page.getByTestId('table-of-contents');
        await expect(toc).toBeVisible();
        await page.evaluate(() => {
            const tocScrollContainer = document.querySelector(
                '[data-testid="table-of-contents"] [data-testid="toc-scroll-container"]'
            );
            if (!tocScrollContainer) {
                throw new Error('TOC scroll container not found');
            }
            tocScrollContainer.scrollTo(0, 0);
        });
    }
}
