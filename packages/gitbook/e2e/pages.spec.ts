import { argosScreenshot } from '@argos-ci/playwright';
import {
    CustomizationBackground,
    CustomizationCorners,
    CustomizationFont,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationLocale,
    CustomizationThemeMode,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { test, expect, Page } from '@playwright/test';
import deepMerge from 'deepmerge';
import jwt from 'jsonwebtoken';
import rison from 'rison';
import { DeepPartial } from 'ts-essentials';

import { getContentTestURL } from '../tests/utils';

interface Test {
    name: string;
    url: string; // URL to visit for testing
    run?: (page: Page) => Promise<unknown>; // The test to run
    fullPage?: boolean; // Whether the test should be fullscreened during testing
    screenshot?: false; // Should a screenshot be stored
    only?: boolean; // Only run this test
}

interface TestsCase {
    name: string;
    baseUrl: string;
    tests: Array<Test>;
}

const allLocales: CustomizationLocale[] = [
    CustomizationLocale.Fr,
    CustomizationLocale.Es,
    CustomizationLocale.Ja,
    CustomizationLocale.Zh,
];

const allThemeModes: CustomizationThemeMode[] = [
    CustomizationThemeMode.Light,
    CustomizationThemeMode.Dark,
];

const allThemePresets: CustomizationHeaderPreset[] = [
    CustomizationHeaderPreset.Default,
    CustomizationHeaderPreset.Bold,
    CustomizationHeaderPreset.Contrast,
    CustomizationHeaderPreset.Custom,
];

async function waitForCookiesDialog(page: Page) {
    const dialog = page.getByRole('dialog', { name: 'Cookies' });
    const accept = dialog.getByRole('button', { name: 'Accept' });
    const reject = dialog.getByRole('button', { name: 'Reject' });
    await expect(accept).toBeVisible();
    await expect(reject).toBeVisible();
}

const testCases: TestsCase[] = [
    {
        name: 'GitBook Site (Single Variant)',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/',
        tests: [
            {
                name: 'Home',
                url: '',
                run: waitForCookiesDialog,
            },
            {
                name: 'No variants dropdown',
                url: '',
                run: async (page) => {
                    await expect(page.locator('[data-testid="space-dropdown-button"]')).toHaveCount(
                        0,
                    );
                },
            },
            {
                name: 'Search',
                url: '?q=',
            },
            {
                name: 'Search Results',
                url: '?q=gitbook',
                run: async (page) => {
                    await page.waitForSelector('[data-test="search-results"]');
                },
            },
            {
                name: 'AI Search',
                url: '?q=What+is+GitBook%3F&ask=true',
                run: async (page) => {
                    await page.waitForSelector('[data-test="search-ask-answer"]');
                },
                screenshot: false,
            },
            {
                name: 'Not found',
                url: 'content-not-found',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'GitBook Site (Multi Variants)',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/multi-variants/',
        tests: [
            {
                name: 'Variants dropdown',
                url: '',
                run: async (page) => {
                    const spaceDrowpdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDrowpdown.waitFor();
                },
            },
            {
                name: 'Default variant',
                url: '',
            },
            {
                name: 'RFC variant',
                url: 'rfcs',
            },
            {
                name: 'Customized variant titles are displayed',
                url: '',
                run: async (page) => {
                    const spaceDrowpdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDrowpdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="space-dropdown-button"] + div',
                    );
                    // the customized space title
                    await expect(
                        variantSelectionDropdown.getByRole('link', {
                            name: 'Multi-Variants',
                        }),
                    ).toBeVisible();

                    // the NON-customized space title
                    await expect(
                        variantSelectionDropdown.getByRole('link', {
                            name: 'RFCs',
                        }),
                    ).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'GitBook Site (Navigation when switching variant)',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/',
        tests: [
            {
                name: 'Keep navigation path/route when switching variant (Public)',
                url: 'api-multi-versions/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    const spaceDrowpdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDrowpdown.click();

                    // Click the second variant in the dropdown
                    await page
                        .getByRole('link', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL(
                        'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions/2.0/reference/api-reference/pets?fallback=true',
                    );
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (Share link)',
                url: 'api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    const spaceDrowpdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDrowpdown.click();

                    // Click the second variant in the dropdown
                    await page
                        .getByRole('link', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL(
                        'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/2.0/reference/api-reference/pets?fallback=true',
                    );
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (VA)',
                screenshot: false,
                url: (() => {
                    const privateKey = 'c26190fc-74b2-4b54-9fc7-df9941104953';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `api-multi-versions-va/reference/api-reference/pets?jwt_token=${token}`;
                })(),
                run: async (page) => {
                    const spaceDrowpdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDrowpdown.click();

                    // Click the second variant in the dropdown
                    await page
                        .getByRole('link', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL(
                        'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-va/2.0/reference/api-reference/pets?fallback=true',
                    );
                },
            },
        ],
    },
    {
        name: 'GitBook',
        baseUrl: 'https://docs.gitbook.com',
        tests: [
            {
                name: 'Home',
                url: '',
                run: waitForCookiesDialog,
            },
            {
                name: 'Search',
                url: '?q=',
            },
            {
                name: 'Search Results',
                url: '?q=gitbook',
                run: async (page) => {
                    await page.waitForSelector('[data-test="search-results"]');
                },
            },
            {
                name: 'AI Search',
                url: '?q=What+is+GitBook%3F&ask=true',
                run: async (page) => {
                    await page.waitForSelector('[data-test="search-ask-answer"]');
                },
                screenshot: false,
            },
            {
                name: 'Not found',
                url: 'content-not-found',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Versioning',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Revision',
                url: '~/revisions/S55pwsEr5UVoroaOiWnP/blocks/headings',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'PDF',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'PDF',
                url: '~gitbook/pdf?limit=10',
            },
        ],
    },
    {
        name: 'Content tests',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Text',
                url: 'text-page',
                run: waitForCookiesDialog,
            },
            {
                name: 'Long text',
                url: 'text-page/long-text',
                run: waitForCookiesDialog,
            },
            {
                name: 'Images',
                url: 'blocks/block-images',
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Inline Images',
                url: 'blocks/inline-images',
                run: waitForCookiesDialog,
            },
            {
                name: 'Tabs',
                url: 'blocks/tabs',
                run: waitForCookiesDialog,
            },
            {
                name: 'Hints',
                url: 'blocks/hints',
                run: waitForCookiesDialog,
            },
            {
                name: 'Integration Blocks',
                url: 'blocks/integrations',
                run: waitForCookiesDialog,
            },
            {
                name: 'Tables',
                url: 'blocks/tables',
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Expandables',
                url: 'blocks/expandables',
                run: waitForCookiesDialog,
            },
            {
                name: 'API Blocks',
                url: 'blocks/api-blocks',
                run: waitForCookiesDialog,
            },
            {
                name: 'Headings',
                url: 'blocks/headings',
                run: waitForCookiesDialog,
            },
            {
                name: 'Marks',
                url: 'blocks/marks',
                run: waitForCookiesDialog,
            },
            {
                name: 'Emojis',
                url: 'blocks/emojis',
                run: waitForCookiesDialog,
            },
            {
                name: 'Links',
                url: 'blocks/links',
                run: waitForCookiesDialog,
            },
            {
                name: 'Lists',
                url: 'blocks/lists',
                fullPage: true,
            },
            {
                name: 'Code',
                url: 'blocks/code',
                fullPage: true,
            },
            {
                name: 'Cards',
                url: 'blocks/cards',
                fullPage: true,
            },
            {
                name: 'Math',
                url: 'blocks/math',
            },
            {
                name: 'Files',
                url: 'blocks/files',
                fullPage: true,
            },
            {
                name: 'Embeds',
                url: 'blocks/embeds',
                fullPage: true,
            },
            {
                name: 'Page links',
                url: 'blocks/page-links',
                fullPage: true,
            },
            {
                name: 'Annotations',
                url: 'blocks/annotations',
                run: async (page) => {
                    await page.waitForSelector('[data-testid="annotation-button"]');
                    await page.click('[data-testid="annotation-button"]');
                },
            },
            {
                name: 'Stepper',
                url: 'blocks/stepper',
            },
        ],
    },
    {
        name: 'Page options',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Hidden',
                url: 'page-options/page-hidden',
                run: waitForCookiesDialog,
            },
            {
                name: 'With cover',
                url: 'page-options/page-with-cover',
                run: waitForCookiesDialog,
            },
            {
                name: 'With hero cover',
                url: 'page-options/page-with-hero-cover',
                run: waitForCookiesDialog,
            },
            {
                name: 'With cover and no TOC',
                url: 'page-options/page-with-cover-and-no-toc',
                run: waitForCookiesDialog,
            },
            {
                name: 'With icon',
                url: 'page-options/page-with-icon',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Customization',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: allThemeModes.flatMap((theme) => [
            {
                name: `Without header - Theme ${theme}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.None,
                        links: [],
                    },
                    themes: {
                        default: theme,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `With duotone icons - Theme ${theme}`,
                url:
                    'page-options/page-with-icon' +
                    getCustomizationURL({
                        styling: {
                            icons: CustomizationIconsStyle.Duotone,
                        },
                        themes: {
                            default: theme,
                            toggeable: false,
                        },
                    }),
                run: waitForCookiesDialog,
            },
            {
                name: `With header buttons - Theme ${theme}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: [
                            {
                                title: 'Secondary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-secondary',
                            },
                            {
                                title: 'Primary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-primary',
                            },
                        ],
                    },
                    themes: {
                        default: theme,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `Without tint - Default preset - Theme ${theme}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: [
                            {
                                title: 'Secondary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-secondary',
                            },
                            {
                                title: 'Primary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-primary',
                            },
                        ],
                    },
                    themes: {
                        default: theme,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            ...allThemePresets.flatMap((preset) => ({
                name: `With tint - Preset ${preset} - Theme ${theme}`,
                url: getCustomizationURL({
                    styling: {
                        tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                    },
                    header: {
                        preset,
                        ...(preset === CustomizationHeaderPreset.Custom
                            ? {
                                  backgroundColor: { light: '#C62C68', dark: '#EF96B8' },
                                  linkColor: { light: '#4DDE98', dark: '#0C693D' },
                              }
                            : {}),
                        links: [
                            {
                                title: 'Secondary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-secondary',
                            },
                            {
                                title: 'Primary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-primary',
                            },
                        ],
                    },
                    themes: {
                        default: theme,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            })),
            {
                name: `With tint - Legacy background match - Theme ${theme}`,
                url: getCustomizationURL({
                    styling: {
                        background: CustomizationBackground.Match,
                    },
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: [
                            {
                                title: 'Secondary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-secondary',
                            },
                            {
                                title: 'Primary button',
                                to: { kind: 'url', url: 'https://www.gitbook.com' },
                                style: 'button-primary',
                            },
                        ],
                    },
                    themes: {
                        default: theme,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
        ]),
    },
    {
        name: 'Ads',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Without previewed ads',
                url: 'text-page?ads_preview=1',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Shared space navigation (first site)',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/shared-space-uno/',
        tests: [
            {
                name: 'Navigation to shared space',
                url: '',
                run: async (page) => {
                    const sharedSpaceLink = page.locator('a.underline');
                    await sharedSpaceLink.click();
                    expect(page.locator('h1')).toHaveText('shared');
                    const url = page.url();
                    expect(url.includes('shared-space-uno')).toBeTruthy(); // same uno site
                    expect(url.endsWith('/shared')).toBeTruthy(); // correct page
                },
            },
        ],
    },
    {
        name: 'Shared space navigation (second site)',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/shared-space-dos/',
        tests: [
            {
                name: 'Navigation to shared space',
                url: '',
                run: async (page) => {
                    const sharedSpaceLink = page.locator('a.underline');
                    await sharedSpaceLink.click();
                    expect(page.locator('h1')).toHaveText('shared');
                    const url = page.url();
                    expect(url.includes('shared-space-dos')).toBeTruthy(); // same dos site
                    expect(url.endsWith('/shared')).toBeTruthy(); // correct page
                },
            },
        ],
    },
    {
        name: 'Site Redirects',
        baseUrl: 'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/',
        tests: [
            {
                name: 'Redirect to SSO page',
                url: 'a/redirect/to/sso',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('SSO');
                },
            },
        ],
    },
    {
        name: 'Share links',
        baseUrl: 'https://gitbook.gitbook.io/gbo-tests-share-links/',
        tests: [
            {
                name: 'Valid link',
                url: 'thDznyWXCeEoT55WB7HC/',
            },
            {
                name: 'Invalid link',
                url: 'invalid/',
                run: async (page) => {
                    await expect(
                        page.getByText('Authentication missing to access this content'),
                    ).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Visitor Auth - Space',
        baseUrl: `https://gitbook.gitbook.io/gbo-va-space/`,
        tests: [
            {
                name: 'First',
                url: (() => {
                    const privateKey = '70b844d0-c519-4532-8586-5970ce48c537';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `first?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Second',
                url: (() => {
                    const privateKey = '70b844d0-c519-4532-8586-5970ce48c537';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `second?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Visitor Auth - Collection',
        baseUrl: `https://gitbook.gitbook.io/gbo-va-collection/`,
        tests: [
            {
                name: 'Root',
                url: (() => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Primary (Space A)',
                url: (() => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `spacea?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Space B',
                url: (() => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `spaceb?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Space C',
                url: (() => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `spacec?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Visitor Auth - Space (custom domain)',
        baseUrl: `https://test.gitbook.community/`,
        tests: [
            {
                name: 'Root',
                url: (() => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'First',
                url: (() => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `first?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Custom page',
                url: (() => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `custom-page?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
            {
                name: 'Inner page',
                url: (() => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `custom-page/inner-page?jwt_token=${token}`;
                })(),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Languages',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: allLocales.map((locale) => ({
            name: locale,
            url: getCustomizationURL({
                internationalization: {
                    locale,
                },
            }),
            run: async (page) => {
                const dialog = page.getByTestId('cookies-dialog');
                await expect(dialog).toBeVisible();
            },
        })),
    },
    {
        name: 'SEO',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: `Index by default`,
                url: '?x-gitbook-search-indexation=true',
                screenshot: false,
                run: async (page) => {
                    const metaRobots = page.locator('meta[name="robots"]');
                    await expect(metaRobots).toHaveAttribute('content', 'index, follow');
                },
            },
            {
                name: `Don't index noIndex`,
                url: 'page-options/page-no-index?x-gitbook-search-indexation=true',
                screenshot: false,
                run: async (page) => {
                    const metaRobots = page.locator('meta[name="robots"]');
                    await expect(metaRobots).toHaveAttribute('content', 'noindex, nofollow');
                },
            },
            {
                name: `Don't index descendant of noIndex`,
                url: 'page-options/page-no-index/descendant-of-page-no-index?x-gitbook-search-indexation=true',
                screenshot: false,
                run: async (page) => {
                    const metaRobots = page.locator('meta[name="robots"]');
                    await expect(metaRobots).toHaveAttribute('content', 'noindex, nofollow');
                },
            },
            {
                name: `Don't index noRobotsIndex`,
                url: 'page-options/page-no-robots-index?x-gitbook-search-indexation=true',
                screenshot: false,
                run: async (page) => {
                    const metaRobots = page.locator('meta[name="robots"]');
                    await expect(metaRobots).toHaveAttribute('content', 'noindex, nofollow');
                },
            },
            {
                name: `Don't index descendant of noRobotsIndex`,
                url: 'page-options/page-no-robots-index/descendant-of-page-no-robots-index?x-gitbook-search-indexation=true',
                screenshot: false,
                run: async (page) => {
                    const metaRobots = page.locator('meta[name="robots"]');
                    await expect(metaRobots).toHaveAttribute('content', 'noindex, nofollow');
                },
            },
        ],
    },
    {
        name: 'Adaptive Content - VA',
        baseUrl: `https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-va/`,
        tests: [
            {
                name: 'isAlphaUser',
                url: (() => {
                    const privateKey = 'afe09cdf-0f43-480a-b54c-8b1f62f174f9';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isAlphaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `?jwt_token=${token}`;
                })(),
                run: async (page) => {
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha users' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta users' });
                    await expect(alphaUserPage).toBeVisible();
                    await expect(betaUserPage).toHaveCount(0);
                },
            },
            {
                name: 'isBetaUser',
                url: (() => {
                    const privateKey = 'afe09cdf-0f43-480a-b54c-8b1f62f174f9';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isBetaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `?jwt_token=${token}`;
                })(),
                run: async (page) => {
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha users' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta users' });
                    await expect(betaUserPage).toBeVisible();
                    await expect(alphaUserPage).toHaveCount(0);
                },
            },
            {
                name: 'isAlphaUser & isBetaUser',
                url: (() => {
                    const privateKey = 'afe09cdf-0f43-480a-b54c-8b1f62f174f9';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isAlphaUser: true,
                            isBetaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        },
                    );
                    return `?jwt_token=${token}`;
                })(),
                run: async (page) => {
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha users' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta users' });
                    await expect(alphaUserPage).toBeVisible();
                    await expect(betaUserPage).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Tables',
        baseUrl: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Default table',
                url: 'blocks/tables',
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Table with straight corners',
                url:
                    'blocks/tables' +
                    getCustomizationURL({
                        styling: {
                            corners: CustomizationCorners.Straight,
                        },
                    }),
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Table with primary color',
                url:
                    'blocks/tables' +
                    getCustomizationURL({
                        styling: {
                            tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                        },
                    }),
                run: waitForCookiesDialog,
                fullPage: true,
            },
            // Test dark mode for each variant
            ...allThemeModes.flatMap((theme) => [
                {
                    name: `Table in ${theme} mode`,
                    url:
                        'blocks/tables' +
                        getCustomizationURL({
                            themes: {
                                default: theme,
                                toggeable: false,
                            },
                        }),
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
                {
                    name: `Table with straight corners in ${theme} mode`,
                    url:
                        'blocks/tables' +
                        getCustomizationURL({
                            styling: {
                                corners: CustomizationCorners.Straight,
                            },
                            themes: {
                                default: theme,
                                toggeable: false,
                            },
                        }),
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
                {
                    name: `Table with primary color in ${theme} mode`,
                    url:
                        'blocks/tables' +
                        getCustomizationURL({
                            styling: {
                                tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                            },
                            themes: {
                                default: theme,
                                toggeable: false,
                            },
                        }),
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
            ]),
        ],
    },
];

for (const testCase of testCases) {
    test.describe(testCase.name, () => {
        for (const testEntry of testCase.tests) {
            const testFn = testEntry.only ? test.only : test;
            testFn(testEntry.name, async ({ page, baseURL }) => {
                const contentUrl = new URL(testEntry.url, testCase.baseUrl);
                const url = getContentTestURL(contentUrl.toString(), baseURL);
                await page.goto(url);
                if (testEntry.run) {
                    await testEntry.run(page);
                }
                if (testEntry.screenshot !== false) {
                    await argosScreenshot(page, `${testCase.name} - ${testEntry.name}`, {
                        viewports: ['macbook-16', 'macbook-13', 'iphone-x', 'ipad-2'],
                        argosCSS: `
                        /* Hide Intercom */
                        .intercom-lightweight-app {
                            display: none !important;
                        }
                    `,
                        fullPage: testEntry.fullPage ?? false,
                    });
                }
            });
        }
    });
}

/**
 * Create a URL with customization settings.
 */
function getCustomizationURL(partial: DeepPartial<SiteCustomizationSettings>): string {
    /**
     * Default customization settings.
     *
     * The customization object passed to the URL should be a valid API settings object. Hence we extend the test with necessary defaults.
     */
    const DEFAULT_CUSTOMIZATION: SiteCustomizationSettings = {
        styling: {
            primaryColor: { light: '#346DDB', dark: '#346DDB' },
            corners: CustomizationCorners.Rounded,
            font: CustomizationFont.Inter,
            background: CustomizationBackground.Plain,
            icons: CustomizationIconsStyle.Regular,
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
