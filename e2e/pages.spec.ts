import { argosScreenshot } from '@argos-ci/playwright';
import {
    CustomizationHeaderPreset,
    CustomizationLocale,
    CustomizationSettings,
} from '@gitbook/api';
import { test, expect, Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import rison from 'rison';

import { getContentTestURL } from '../tests/utils';

interface Test {
    name: string;
    url: string;
    run?: (page: Page) => Promise<unknown>;
    fullPage?: boolean;
    screenshot?: false;
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

async function waitForCookiesDialog(page: Page) {
    const dialog = page.getByRole('dialog', { name: 'Cookies' });
    const accept = dialog.getByRole('button', { name: 'Accept' });
    const reject = dialog.getByRole('button', { name: 'Reject' });
    await expect(accept).toBeVisible();
    await expect(reject).toBeVisible();
}

const testCases: TestsCase[] = [
    {
        name: 'GitBook Site',
        baseUrl: 'https://gitbook-sites.gitbook.io/gitbook-site/',
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
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
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
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: [
            {
                name: 'PDF',
                url: '~gitbook/pdf?limit=10',
            },
        ],
    },
    {
        name: 'Content tests',
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
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
                name: 'Embeds',
                url: 'blocks/embeds',
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
        ],
    },
    {
        name: 'Page options',
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: [
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
        ],
    },
    {
        name: 'Customization',
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: [
            {
                name: 'Without header',
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.None,
                        links: [],
                    },
                }),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Share links',
        baseUrl: 'https://gitbook.gitbook.io/test-share-links/',
        tests: [
            {
                name: 'Valid link',
                url: 'Fc6mMII9FKgnwm7qqynx/',
                run: waitForCookiesDialog,
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
                    return `v/spacea?jwt_token=${token}`;
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
                    return `v/spaceb?jwt_token=${token}`;
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
                    return `v/spacec?jwt_token=${token}`;
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
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: allLocales.map((locale) => ({
            name: locale,
            url: getCustomizationURL({
                internationalization: {
                    locale,
                    inherit: false,
                },
            }),
            run: async (page) => {
                const dialog = page.getByTestId('cookies-dialog');
                await expect(dialog).toBeVisible();
            },
        })),
    },
];

for (const testCase of testCases) {
    test.describe(testCase.name, () => {
        for (const testEntry of testCase.tests) {
            test(testEntry.name, async ({ page, baseURL }) => {
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
function getCustomizationURL(partial: Partial<CustomizationSettings>): string {
    const encoded = rison.encode_object(partial);

    const searchParams = new URLSearchParams();
    searchParams.set('customization', encoded);

    return `?${searchParams.toString()}`;
}
