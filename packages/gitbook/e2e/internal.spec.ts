import {
    CustomizationAIMode,
    CustomizationBackground,
    CustomizationCorners,
    CustomizationDefaultMonospaceFont,
    CustomizationDepth,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationSidebarListStyle,
    CustomizationThemeMode,
} from '@gitbook/api';
import { expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

import {
    VISITOR_TOKEN_COOKIE,
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
} from '@/lib/visitors';

import { getSiteAPIToken } from '../tests/utils';
import {
    type Test,
    type TestsCase,
    allDeprecatedThemePresets,
    allLocales,
    allSearchStyles,
    allSidebarBackgroundStyles,
    allThemeModes,
    allThemes,
    allTintColors,
    getCustomizationURL,
    headerLinks,
    runTestCases,
    waitForCookiesDialog,
    waitForNotFound,
} from './util';

const searchTestCases: Test[] = [
    {
        name: 'Search - AI Mode: None - Complete flow',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await expect(page.getByTestId('search-results')).toHaveCount(0); // No pop-up yet because there's no recommended questions.

            // Fill search input, expecting search results
            await searchInput.fill('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible();
            const pageResults = await page.getByTestId('search-page-result').all();
            await expect(pageResults.length).toBeGreaterThanOrEqual(1);
            const pageSectionResults = await page.getByTestId('search-page-section-result').all();
            await expect(pageSectionResults.length).toBeGreaterThanOrEqual(2);
            await expect(page.getByTestId('search-ask-question')).toHaveCount(0); // No AI search results with aiMode=None.
        },
    },
    {
        name: 'Search - AI Mode: None - Keyboard shortcut',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await page.keyboard.press('ControlOrMeta+K');
            await expect(page.getByTestId('search-input')).toBeFocused();
        },
    },
    {
        name: 'Search - AI Mode: None - URL query (Initial)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        })}&q=`,
        run: async (page) => {
            await expect(page.getByTestId('search-results')).toHaveCount(0); // No pop-up yet because there's no recommended questions.
        },
    },
    {
        name: 'Search - AI Mode: None - URL query (Results)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        })}&q=gitbook`,
        run: async (page) => {
            await expect(page.getByTestId('search-input')).toBeFocused();
            await expect(page.getByTestId('search-input')).toHaveValue('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible();
        },
    },
    // TODO: Re-enable the following tests when we have fixed the AI Search timing out:
    // - Search - AI Mode: Search - Complete flow
    // - Search - AI Mode: Search - URL query (Initial)
    {
        name: 'Search - AI Mode: Search - URL query (Results)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Search,
            },
        })}&q=gitbook`,
        screenshot: false,
        run: async (page) => {
            await expect(page.getByTestId('search-input')).toBeFocused();
            await expect(page.getByTestId('search-input')).toHaveValue('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible();
        },
    },
    // TODO: Re-enable the following tests when we have fixed the AI Search timing out:
    // - Ask - AI Mode: Search - URL query (Ask initial)
    // - Ask - AI Mode: Search - URL query (Ask results)
    {
        name: 'Ask - AI Mode: Assistant - Complete flow',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        screenshot: false,
        run: async (page) => {
            const searchInput = page.locator('css=[data-testid="search-input"]');

            // Focus search input, expecting recommended questions
            await searchInput.focus();
            // TODO: Re-enable this part of the test when we have fixed the AI Search timing out
            // await expect(page.getByTestId('search-results')).toBeVisible();
            // const recommendedQuestions = await page
            //     .getByTestId('search-recommended-question')
            //     .all();
            // await expect(recommendedQuestions.length).toBeGreaterThan(2); // Expect at least 3 questions

            // Fill search input, expecting AI search option
            await searchInput.fill('What is gitbook?');
            const aiSearchResult = page.getByTestId('search-ask-question');
            await expect(aiSearchResult).toBeVisible();
            await aiSearchResult.click();
            await expect(page.getByTestId('ai-chat')).toBeVisible();
        },
    },
    {
        name: 'Ask - AI Mode: Assistant - Keyboard shortcut',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await page.keyboard.press('ControlOrMeta+I');
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
    },
    {
        name: 'Ask - AI Mode: Assistant - Button',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await page.getByTestId('ai-chat-button').click();
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
    },
    {
        name: 'Ask - AI Mode: Assistant - URL query (Initial)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        })}&ask=`,
        screenshot: false,
        run: async (page) => {
            await expect(page.getByTestId('search-input')).not.toBeFocused();
            await expect(page.getByTestId('search-input')).not.toHaveValue('What is GitBook?');
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
    },
    {
        name: 'Ask - AI Mode: Assistant - URL query (Results)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        })}&ask=What+is+GitBook%3F`,
        screenshot: false,
        run: async (page) => {
            await expect(page.getByTestId('search-input')).not.toBeFocused();
            await expect(page.getByTestId('search-input')).not.toHaveValue('What is GitBook?');
            await expect(page.getByTestId('ai-chat')).toBeVisible({
                timeout: 15_000,
            });
            await expect(page.getByTestId('ai-chat-message').first()).toHaveText(
                'What is GitBook?'
            );
        },
    },
];

const testCases: TestsCase[] = [
    {
        name: 'GitBook Site (Single Variant)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/',
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
                        0
                    );
                },
            },
            ...searchTestCases,
            {
                name: 'Not found',
                url: 'content-not-found',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'GitBook Site (Multi Variants)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/multi-variants/',
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
                    const spaceDropdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );
                    // the customized space title
                    await expect(
                        variantSelectionDropdown.getByRole('menuitem', {
                            name: 'Multi-Variants',
                        })
                    ).toBeVisible();

                    // the NON-customized space title
                    await expect(
                        variantSelectionDropdown.getByRole('menuitem', {
                            name: 'RFCs',
                        })
                    ).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'GitBook Site (Navigation when switching variant)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/',
        tests: [
            {
                name: 'Keep navigation path/route when switching variant (Public)',
                url: 'api-multi-versions/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    const spaceDropdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );
                    // Click the second variant in the dropdown
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL((url) =>
                        url.pathname.includes('api-multi-versions/2.0/reference/api-reference/pets')
                    );
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (Share link)',
                url: 'api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    const spaceDropdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );

                    // Click the second variant in the dropdown
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL((url) =>
                        url.pathname.includes(
                            'api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/2.0/reference/api-reference/pets'
                        )
                    );
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (VA)',
                screenshot: false,
                url: () => {
                    const privateKey = 'c26190fc-74b2-4b54-9fc7-df9941104953';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `api-multi-versions-va/reference/api-reference/pets?jwt_token=${token}`;
                },
                run: async (page) => {
                    const spaceDropdown = await page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );

                    // Click the second variant in the dropdown
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: '2.0',
                        })
                        .click();

                    // It should keep the current page path, i.e "reference/api-reference/pets" when navigating to the new variant
                    await page.waitForURL((url) =>
                        url.pathname.includes(
                            'api-multi-versions-va/2.0/reference/api-reference/pets'
                        )
                    );
                },
            },
        ],
    },
    {
        name: 'GitBook Site (Sections and Section Groups)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/sections/',
        tests: [
            {
                name: 'Site with sections and section groups',
                url: '',
            },
            {
                name: 'Section group dropdown',
                url: '',
                run: async (page) => {
                    await page.getByRole('button', { name: 'Test Section Group 1' }).hover();
                    await expect(page.getByRole('link', { name: /Section B/ })).toBeVisible();
                },
            },
            {
                name: 'Section group link',
                url: '',
                screenshot: false,
                run: async (page) => {
                    const sectionGroupDropdown = await page.getByText('Test Section Group 1');
                    await sectionGroupDropdown.hover();
                    await page.getByText('Section B').click();
                    await page.waitForURL((url) => url.pathname.includes('/sections/sections-4'));
                },
            },
        ],
    },
    {
        name: 'GitBook',
        contentBaseURL: 'https://gitbook.com/docs/',
        tests: [
            {
                name: 'Home',
                url: '',
                run: waitForCookiesDialog,
            },
            ...searchTestCases,
            {
                name: 'Not found',
                url: 'content-not-found',
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Versioning',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Revision',
                url: '~/revisions/S55pwsEr5UVoroaOiWnP/blocks/headings',
                run: waitForCookiesDialog,
            },
            {
                name: 'Invalid revision',
                url: '~/revisions/idnotfound/blocks/headings',
                run: waitForNotFound,
                screenshot: false,
            },
            {
                name: 'Invalid change request',
                url: '~/changes/idnotfound/blocks/headings',
                run: waitForNotFound,
                screenshot: false,
            },
        ],
    },
    {
        name: 'PDF',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'PDF',
                url: '~gitbook/pdf?limit=10',
                screenshot: {
                    waitForTOCScrolling: false,
                },
                run: async (page) => {
                    await expect(page.locator('[data-testid="print-button"]')).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Space PDF',
        tests: [
            {
                name: 'Main content',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    const searchParams = new URLSearchParams();
                    searchParams.set('limit', '10');
                    searchParams.set('token', data.apiToken);

                    return `~space/${data.space}/~gitbook/pdf?${searchParams.toString()}`;
                },
                screenshot: false,
                run: async (page) => {
                    await expect(page.locator('[data-testid="print-button"]')).toBeVisible();
                },
            },
            {
                name: 'Change request',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    const searchParams = new URLSearchParams();
                    searchParams.set('limit', '10');
                    searchParams.set('token', data.apiToken);

                    return `~space/${data.space}/~/changes/HrtgUd5MlFusCMv1elA7/~gitbook/pdf?${searchParams.toString()}`;
                },
                screenshot: false,
                run: async (page) => {
                    await expect(page.locator('[data-testid="print-button"]')).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Site Preview',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        tests: [
            {
                name: 'Main content',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    const searchParams = new URLSearchParams();
                    searchParams.set('token', data.apiToken);

                    return `url/preview/${data.site}/?${searchParams.toString()}`;
                },
                screenshot: false,
                run: async (page) => {
                    await expect(page.locator('[data-testid="table-of-contents"]')).toBeVisible();
                },
            },
            {
                name: 'With sections',
                url: async () => {
                    const data = await getSiteAPIToken('https://gitbook.com/docs');

                    const searchParams = new URLSearchParams();
                    searchParams.set('token', data.apiToken);

                    return `url/preview/${data.site}/?${searchParams.toString()}`;
                },
                screenshot: false,
                run: async (page) => {
                    const sectionTabs = page.getByLabel('Sections');
                    await expect(sectionTabs).toBeVisible();

                    const sectionTabLinks = sectionTabs.getByRole('link');
                    for (const link of await sectionTabLinks.all()) {
                        const href = await link.getAttribute('href');
                        expect(href).toMatch(/^\/url\/preview\/site_p4Xo4\/?/);
                    }
                },
            },
        ],
    },
    {
        name: 'Markdown page',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Text page',
                url: 'text-page.md',
                screenshot: false,
                run: async (_page, response) => {
                    expect(response?.status()).toBe(200);
                    expect(response?.headers()['content-type']).toContain('text/markdown');
                },
            },
        ],
    },
    {
        name: 'llms.txt',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'llms.txt',
                url: 'llms.txt',
                screenshot: false,
                run: async (_page, response) => {
                    expect(response?.status()).toBe(200);
                    expect(response?.headers()['content-type']).toContain('text/markdown');
                },
            },
        ],
    },
    {
        name: 'llms-full.txt',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'llms-full.txt',
                url: 'llms-full.txt',
                screenshot: false,
                run: async (_page, response) => {
                    expect(response?.status()).toBe(200);
                    expect(response?.headers()['content-type']).toContain('text/markdown');
                },
            },
        ],
    },
    {
        name: '[page].md',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'blocks.md',
                url: 'blocks.md',
                screenshot: false,
                run: async (_page, response) => {
                    expect(response?.status()).toBe(200);
                    expect(response?.headers()['content-type']).toContain('text/markdown');
                },
            },
        ],
    },
    {
        name: 'Site subdirectory (proxy)',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://nextjs-gbo-proxy.vercel.app/documentation/',
        tests: [
            {
                name: 'Main',
                url: '',
                fullPage: true,
            },
        ],
    },
    {
        name: 'Site subdirectory (proxy) with VA',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        contentBaseURL: 'https://nextjs-gbo-proxy-va.vercel.app/va/docs/',
        tests: [
            {
                name: 'Main',
                url: () => {
                    const privateKey =
                        'rqSfA6x7eAKx1qDRCDq9aCXwivpUvQ8YkXeDdFvCCUa9QchIcM7pF1iJ4o7AGOU49spmOWjKoIPtX0pVUVQ81w==';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
                fullPage: true,
            },
        ],
    },
    {
        name: 'Content tests',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
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
                screenshot: { threshold: 0.9 },
            },
            {
                name: 'Images (with zoom)',
                url: 'blocks/block-images',
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    const zoomImage = page.getByTestId('zoom-image');
                    await zoomImage.first().click();
                    await expect(page.getByTestId('zoom-image-modal')).toBeVisible();
                },
                screenshot: { threshold: 0.8 },
            },
            {
                name: 'Inline Images',
                url: 'blocks/inline-images',
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    // Make the text invisible to fix flakiness due to the text position.
                    await page.evaluate(() => {
                        for (const p of document.querySelectorAll('p')) {
                            if (
                                p.textContent?.includes(
                                    'This image has intrinsic 400px width, but renders as 300px:'
                                )
                            ) {
                                p.style.color = 'transparent';
                            }
                        }
                    });
                },
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
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    const mermaidIframe = page.locator('iframe[title*="mermaid"]').contentFrame();
                    await expect(mermaidIframe.getByText('Mermaid', { exact: true })).toBeVisible();
                    await expect(mermaidIframe.getByText('Diagram', { exact: true })).toBeVisible();
                },
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
                name: 'Icons',
                url: 'blocks/icons',
                run: waitForCookiesDialog,
            },
            {
                name: 'Links',
                url: 'blocks/links',
                run: waitForCookiesDialog,
            },
            {
                name: 'Buttons',
                url: 'blocks/buttons',
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
                run: async (page) => {
                    await page.waitForFunction(() => {
                        const fonts = Array.from(document.fonts.values());
                        const mjxFonts = fonts.filter(
                            (font) => font.family === 'MJXZERO' || font.family === 'MJXTEX'
                        );
                        return (
                            mjxFonts.length === 2 &&
                            mjxFonts.every((font) => font.status === 'loaded')
                        );
                    });
                },
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
            { name: 'Columns', url: 'blocks/columns' },
        ],
    },
    {
        name: 'Page options',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
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
                name: 'With cover for dark mode',
                url: `page-options/page-with-dark-cover${getCustomizationURL({
                    themes: {
                        default: CustomizationThemeMode.Dark,
                        toggeable: false,
                    },
                })}`,
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
                screenshot: {
                    waitForTOCScrolling: false,
                },
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
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: allThemeModes.flatMap((themeMode) => [
            {
                name: `Without header - Theme mode ${themeMode}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.None,
                        links: [],
                    },
                    themes: {
                        default: themeMode,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `With duotone icons - Theme mode ${themeMode}`,
                url: `page-options/page-with-icon${getCustomizationURL({
                    styling: {
                        icons: CustomizationIconsStyle.Duotone,
                    },
                    themes: {
                        default: themeMode,
                        toggeable: false,
                    },
                })}`,
                run: waitForCookiesDialog,
            },
            {
                name: `With header buttons - Theme mode ${themeMode}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: headerLinks,
                    },
                    themes: {
                        default: themeMode,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `Without tint - Default preset - Theme mode ${themeMode}`,
                url: getCustomizationURL({
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: headerLinks,
                    },
                    themes: {
                        default: themeMode,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `With custom monospace font - Theme mode ${themeMode}`,
                url: `blocks/code${getCustomizationURL({
                    styling: {
                        monospaceFont: CustomizationDefaultMonospaceFont.SpaceMono,
                    },
                })}`,
                run: waitForCookiesDialog,
            },
            // New site themes
            ...allThemes.flatMap((theme) => [
                ...allTintColors.flatMap((tint) => [
                    ...allSidebarBackgroundStyles.flatMap((sidebarStyle) => ({
                        name: `Theme ${theme} - Tint ${tint.label} - Sidebar ${sidebarStyle} - Mode ${themeMode}`,
                        url: getCustomizationURL({
                            styling: {
                                theme,
                                ...(tint.value ? { tint: { color: tint.value } } : {}),
                                sidebar: {
                                    background: sidebarStyle,
                                    list: CustomizationSidebarListStyle.Default,
                                },
                            },
                            header: {
                                links: headerLinks,
                            },
                            themes: {
                                default: themeMode,
                                toggeable: false,
                            },
                        }),
                        run: waitForCookiesDialog,
                    })),
                ]),
                ...allSearchStyles.flatMap((searchStyle) => ({
                    name: `Theme ${theme} – Search ${searchStyle} – Mode ${themeMode}`,
                    url: getCustomizationURL({
                        styling: {
                            theme,
                            search: searchStyle,
                        },
                        header: {
                            links: headerLinks,
                        },
                        themes: {
                            default: themeMode,
                            toggeable: false,
                        },
                    }),
                    run: waitForCookiesDialog,
                })),
            ]),
            // Deprecated header themes
            ...allDeprecatedThemePresets.flatMap((preset) => [
                ...allSidebarBackgroundStyles.flatMap((sidebarStyle) => ({
                    name: `With tint - Legacy header preset ${preset} - Sidebar ${sidebarStyle} - Theme mode ${themeMode}`,
                    url: getCustomizationURL({
                        styling: {
                            tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                            sidebar: {
                                background: sidebarStyle,
                                list: CustomizationSidebarListStyle.Default,
                            },
                        },
                        header: {
                            preset,
                            ...(preset === CustomizationHeaderPreset.Custom
                                ? {
                                      backgroundColor: { light: '#C62C68', dark: '#EF96B8' },
                                      linkColor: { light: '#4DDE98', dark: '#0C693D' },
                                  }
                                : {}),
                            links: headerLinks,
                        },
                        themes: {
                            default: themeMode,
                            toggeable: false,
                        },
                    }),
                    run: waitForCookiesDialog,
                })),
            ]),
            {
                name: `With tint - Legacy background match - Theme mode ${themeMode}`,
                url: getCustomizationURL({
                    styling: {
                        background: CustomizationBackground.Match,
                    },
                    header: {
                        preset: CustomizationHeaderPreset.Default,
                        links: headerLinks,
                    },
                    themes: {
                        default: themeMode,
                        toggeable: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
            {
                name: `With flat and circular corners - Theme mode ${themeMode}`,
                url: getCustomizationURL({
                    styling: {
                        depth: CustomizationDepth.Flat,
                        corners: CustomizationCorners.Circular,
                    },
                }),
                run: waitForCookiesDialog,
            },
        ]),
    },
    {
        name: 'Page actions',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Without page actions',
                url: getCustomizationURL({
                    pageActions: {
                        markdown: false,
                        externalAI: false,
                    },
                }),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Ads',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
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
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/shared-space-uno/',
        tests: [
            {
                name: 'Navigation to shared space',
                url: '',
                run: async (page) => {
                    const sharedSpaceLink = page.locator('a.underline');
                    await sharedSpaceLink.click();
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'shared' })
                    ).toBeVisible();
                    const url = page.url();
                    expect(url.includes('shared-space-uno')).toBeTruthy(); // same uno site
                    expect(url.endsWith('/shared/')).toBeTruthy(); // correct page
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Shared space navigation (second site)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/shared-space-dos/',
        tests: [
            {
                name: 'Navigation to shared space',
                url: '',
                run: async (page) => {
                    await page.locator('a.underline').click();
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'shared' })
                    ).toBeVisible();
                    const url = page.url();
                    expect(url.includes('shared-space-dos')).toBeTruthy(); // same dos site
                    expect(url.endsWith('/shared/')).toBeTruthy(); // correct page
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Site Redirects',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/',
        tests: [
            {
                name: 'Redirect to SSO page',
                url: 'a/redirect/to/sso',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('SSO');
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Content Redirects',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/gitbook-doc/',
        tests: [
            {
                name: 'Redirect to new location',
                url: '/content-editor/editing-content/inline/redirect-test',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('Redirect test');
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Site Redirects with sections',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/sections/',
        tests: [
            {
                // This test that a redirect that incudes a section path works
                name: 'Redirect to Quickstart page',
                url: 'sections-2/redirect-test',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('Quickstart');
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Share links',
        contentBaseURL: 'https://gitbook.gitbook.io/gbo-tests-share-links/',
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
                        page.getByText('Authentication missing to access this content')
                    ).toBeVisible();
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Visitor Auth - Space',
        contentBaseURL: 'https://gitbook.gitbook.io/gbo-va-space/',
        tests: [
            {
                name: 'First',
                url: () => {
                    const privateKey = '70b844d0-c519-4532-8586-5970ce48c537';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `first?jwt_token=${token}`;
                },
                run: async (page) => {
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'first' })
                    ).toBeVisible();
                },
                screenshot: false,
            },
            {
                name: 'Second',
                url: () => {
                    const privateKey = '70b844d0-c519-4532-8586-5970ce48c537';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `second?jwt_token=${token}`;
                },
                run: async (page) => {
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'second' })
                    ).toBeVisible();
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Visitor Auth - Collection',
        contentBaseURL: 'https://gitbook.gitbook.io/gbo-va-collection/',
        tests: [
            {
                name: 'Root',
                url: () => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
            {
                name: 'Primary (Space A)',
                url: () => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );

                    // Test that when accessing the non-canonical URL, we are redirected to the canonical URL
                    // with the jwt token in the query string
                    return `spacea?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
            {
                name: 'Space B',
                url: () => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `spaceb?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
            {
                name: 'Space C',
                url: () => {
                    const privateKey = 'af5688dc-f0b6-4146-9b1d-6d834c62c980';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `spacec?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Visitor Auth - Space (custom domain)',
        contentBaseURL: 'https://test.gitbook.community/',
        tests: [
            {
                name: 'Root',
                url: () => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
            {
                name: 'First',
                url: () => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `first?jwt_token=${token}`;
                },
                run: async (page) => {
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'first' })
                    ).toBeVisible();
                },
                screenshot: false,
            },
            {
                name: 'Custom page',
                url: () => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `custom-page?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
            {
                name: 'Inner page',
                url: () => {
                    const privateKey = '19c8166f-c436-4ed1-a24e-60954b804021';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `custom-page/inner-page?jwt_token=${token}`;
                },
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Visitor Auth - Site (redirects to fallback/auth URL)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/va-site-redirects-fallback/',
        tests: [
            {
                name: 'Redirect to fallback on invalid token pulled from cookie',
                url: '',
                screenshot: false,
                cookies: (() => {
                    const basePath = '/va-site-redirects-fallback/';
                    const invalidToken = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        'invalidKey',
                        {
                            expiresIn: '24h',
                        }
                    );
                    return [
                        {
                            name: getVisitorAuthCookieName(basePath),
                            value: getVisitorAuthCookieValue(basePath, invalidToken),
                            httpOnly: true,
                        },
                    ];
                })(),
                run: async (page) => {
                    await expect(page).toHaveURL(/https:\/\/www.google.com/);
                },
            },
            {
                name: 'Show error message when invalid token is passed to url',
                screenshot: false,
                url: () => {
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                        },
                        'invalidKey',
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
                run: async (page) => {
                    await expect(page.locator('pre')).toContainText(
                        'Error while validating the JWT token. Reason: The token signature is invalid.'
                    );
                },
            },
        ],
    },
    {
        name: 'Languages',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
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
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Index by default',
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
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-va/',
        tests: [
            {
                name: 'isAlphaUser',
                url: () => {
                    const privateKey = 'afe09cdf-0f43-480a-b54c-8b1f62f174f9';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isAlphaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
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
                url: () => {
                    const privateKey = 'afe09cdf-0f43-480a-b54c-8b1f62f174f9';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isBetaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return `?jwt_token=${token}`;
                },
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
                url: () => {
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
                        }
                    );
                    return `?jwt_token=${token}`;
                },
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
        name: 'Adaptive Content - Public',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/',
        tests: [
            {
                name: 'No custom cookie',
                url: '',
                run: async (page) => {
                    const welcomePage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Welcome Page' });
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha User' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta User' });

                    await expect(welcomePage).toBeVisible();
                    await expect(alphaUserPage).toHaveCount(0);
                    await expect(betaUserPage).toHaveCount(0);
                },
            },
            {
                name: 'Custom cookie with isAlphaUser claim',
                cookies: (() => {
                    const privateKey = '4ddd3c2f-e4b7-4e73-840b-526c3be19746';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isAlphaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return [
                        {
                            name: VISITOR_TOKEN_COOKIE,
                            value: token,
                            httpOnly: true,
                        },
                    ];
                })(),
                url: '',
                run: async (page) => {
                    const welcomePage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Welcome Page' });
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha User' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta User' });

                    await expect(welcomePage).toBeVisible();
                    await expect(alphaUserPage).toBeVisible();
                    await expect(betaUserPage).toHaveCount(0);
                },
            },
            {
                name: 'Custom cookie with isBetaUser claim',
                cookies: (() => {
                    const privateKey = '4ddd3c2f-e4b7-4e73-840b-526c3be19746';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isBetaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return [
                        {
                            name: VISITOR_TOKEN_COOKIE,
                            value: token,
                            httpOnly: true,
                        },
                    ];
                })(),
                url: '',
                run: async (page) => {
                    const welcomePage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Welcome Page' });
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha User' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta User' });

                    await expect(welcomePage).toBeVisible();
                    await expect(betaUserPage).toBeVisible();
                    await expect(alphaUserPage).toHaveCount(0);
                },
            },
            {
                name: 'Custom cookie with isAlphaUser & isBetaUser claims',
                cookies: (() => {
                    const privateKey = '4ddd3c2f-e4b7-4e73-840b-526c3be19746';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            isAlphaUser: true,
                            isBetaUser: true,
                        },
                        privateKey,
                        {
                            expiresIn: '24h',
                        }
                    );
                    return [
                        {
                            name: VISITOR_TOKEN_COOKIE,
                            value: token,
                            httpOnly: true,
                        },
                    ];
                })(),
                url: '',
                run: async (page) => {
                    const welcomePage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Welcome Page' });
                    const alphaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Alpha User' });
                    const betaUserPage = page
                        .locator('a[class*="group\\/toclink"]')
                        .filter({ hasText: 'Beta User' });

                    await expect(welcomePage).toBeVisible();
                    await expect(betaUserPage).toBeVisible();
                    await expect(alphaUserPage).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Tables',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Default table',
                url: 'blocks/tables',
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Table with straight corners',
                url: `blocks/tables${getCustomizationURL({
                    styling: {
                        corners: CustomizationCorners.Straight,
                    },
                })}`,
                run: waitForCookiesDialog,
                fullPage: true,
            },
            {
                name: 'Table with primary color',
                url: `blocks/tables${getCustomizationURL({
                    styling: {
                        tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                    },
                })}`,
                run: waitForCookiesDialog,
                fullPage: true,
            },
            // Test dark mode for each variant
            ...allThemeModes.flatMap((theme) => [
                {
                    name: `Table in ${theme} mode`,
                    url: `blocks/tables${getCustomizationURL({
                        themes: {
                            default: theme,
                            toggeable: false,
                        },
                    })}`,
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
                {
                    name: `Table with straight corners in ${theme} mode`,
                    url: `blocks/tables${getCustomizationURL({
                        styling: {
                            corners: CustomizationCorners.Straight,
                        },
                        themes: {
                            default: theme,
                            toggeable: false,
                        },
                    })}`,
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
                {
                    name: `Table with primary color in ${theme} mode`,
                    url: `blocks/tables${getCustomizationURL({
                        styling: {
                            tint: { color: { light: '#346DDB', dark: '#346DDB' } },
                        },
                        themes: {
                            default: theme,
                            toggeable: false,
                        },
                    })}`,
                    run: waitForCookiesDialog,
                    fullPage: true,
                },
            ]),
        ],
    },
];

runTestCases(testCases);
