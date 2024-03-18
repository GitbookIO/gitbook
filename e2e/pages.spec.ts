import { argosScreenshot } from '@argos-ci/playwright';
import {
    CustomizationHeaderPreset,
    CustomizationLocale,
    CustomizationSettings,
} from '@gitbook/api';
import { test, Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import rison from 'rison';

import { getContentTestURL } from '../tests/utils';

interface Test {
    name: string;
    url: string;
    run?: (page: Page) => Promise<unknown>;
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

const testCases: TestsCase[] = [
    {
        name: 'GitBook',
        baseUrl: 'https://docs.gitbook.com',
        tests: [
            {
                name: 'Home',
                url: '',
            },
            {
                name: 'Search',
                url: '?q=',
            },
            {
                name: 'Search Results',
                url: '?q=gitbook',
                run: (page) => page.waitForSelector('[data-test="search-results"]'),
            },
            {
                name: 'AI Search',
                url: '?q=What+is+GitBook%3F&ask=true',
                run: (page) => page.waitForSelector('[data-test="search-ask-answer"]'),
            },
            {
                name: 'Not found',
                url: 'content-not-found',
            },
        ],
    },
    {
        name: 'GitBook Examples',
        baseUrl: 'https://examples.gitbook.com',
        tests: [
            {
                name: 'Landing page',
                url: '',
            },
        ],
    },
    {
        name: 'Snyk',
        baseUrl: 'https://docs.snyk.io',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Rocket.Chat',
        baseUrl: 'https://docs.rocket.chat',
        tests: [
            {
                name: 'Home',
                url: '',
            },
        ],
    },
    {
        name: 'Versioning',
        baseUrl: 'https://gitbook.gitbook.io/test-1-1/',
        tests: [
            {
                name: 'Revision',
                url: '~/revisions/S55pwsEr5UVoroaOiWnP',
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
            },
            {
                name: 'Long text',
                url: 'text-page/long-text',
            },
            {
                name: 'Images',
                url: 'blocks/block-images',
            },
            {
                name: 'Inline Images',
                url: 'blocks/inline-images',
            },
            {
                name: 'Tabs',
                url: 'blocks/tabs',
            },
            {
                name: 'Hints',
                url: 'blocks/hints',
            },
            {
                name: 'Integration Blocks',
                url: 'blocks/integrations',
            },
            {
                name: 'Tables',
                url: 'blocks/tables',
            },
            {
                name: 'Expandables',
                url: 'blocks/expandables',
            },
            {
                name: 'API Blocks',
                url: 'blocks/api-blocks',
            },
            {
                name: 'Headings',
                url: 'blocks/headings',
            },
            {
                name: 'Marks',
                url: 'blocks/marks',
            },
            {
                name: 'Emojis',
                url: 'blocks/emojis',
            },
            {
                name: 'Links',
                url: 'blocks/links',
            },
            {
                name: 'Lists',
                url: 'blocks/lists',
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
            },
            {
                name: 'Invalid link',
                url: 'invalid/',
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
                await argosScreenshot(page, `${testCase.name} - ${testEntry.name}`, {
                    viewports: ['macbook-13', 'iphone-x', 'ipad-2'],
                    argosCSS: `
                        /* Hide Intercom */
                        .intercom-lightweight-app {
                            display: none !important;
                        }
                    `,
                });
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
