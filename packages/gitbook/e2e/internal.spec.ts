import { type Page, type Request, type Route, expect, test } from '@playwright/test';
import jwt from 'jsonwebtoken';

import {
    CustomizationAIMode,
    CustomizationBackground,
    CustomizationCorners,
    CustomizationDefaultMonospaceFont,
    CustomizationDefaultThemeMode,
    CustomizationDepth,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationPageActionType,
    CustomizationSidebarListStyle,
    GitBookAPI,
    SiteSocialAccountPlatform,
} from '@gitbook/api';
import type { GitBookStandalone } from '@gitbook/embed';

import { getContentTestURL, getGitBookPreviewURL, getSiteAPIToken } from '../tests/utils';
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
    setTimeToMorning,
    waitForAIChatResponse,
    waitForAdminToolbar,
    waitForCookiesDialog,
    waitForCoverImages,
    waitForHydration,
    waitForNotFound,
} from './util';
import { VISITOR_TOKEN_COOKIE } from '@/lib/visitors';

// Kept as deterministic as possible to reduce visual flakiness: no preamble, a
// single fixed search, and a concise answer. The model is never perfectly
// deterministic, so `overrideAIResponse` still normalizes the rendered content
// below — this prompt just narrows the variance.
const AI_PROMPT = [
    "You're being invoked by the GitBook CI/CD pipeline for automated visual testing.",
    'Follow these instructions exactly and do not deviate:',
    '1. Do not write any preamble, commentary, or reasoning before acting.',
    '2. Perform a single search for exactly "Lorem ipsum".',
    '3. Reply with only the first sentence of the first page you find, and nothing else.',
].join('\n');

// `InsightsProvider` debounces its flushes by 1.5s.
const INSIGHTS_FLUSH_TIMEOUT = 3000;

/**
 * Collect the insights events of a given type sent by the page and its frames.
 */
function trackInsightsEvents(page: Page, type: string) {
    const collected: { type: string }[] = [];

    page.on('request', (request) => {
        if (request.method() !== 'POST' || !request.url().includes('/~gitbook/__evt')) {
            return;
        }

        const body = request.postDataJSON() as { events?: { type: string }[] } | null;
        collected.push(...(body?.events ?? []).filter((event) => event.type === type));
    });

    return collected;
}

/**
 * Hold the page's search requests until the test answers them, and find a held one by query.
 */
async function holdSearchRequests(page: Page) {
    // Without a pass every search goes through the route, whether or not the site's flag gives one.
    await page.route('**/~gitbook/search-pass', (route) => route.fulfill({ status: 204 }));
    const held: Route[] = [];
    await page.route('**/~gitbook/search', (route) => {
        held.push(route);
    });

    return async (query: string) => {
        await expect
            .poll(() => held.some((route) => route.request().postDataJSON().query === query))
            .toBe(true);
        const index = held.findIndex((route) => route.request().postDataJSON().query === query);
        const [route] = held.splice(index, 1);
        if (!route) {
            throw new Error(`No held search for "${query}"`);
        }
        return route;
    };
}

/**
 * Answer a held search request with the server's own answer, and return its top result.
 */
async function answerSearch(route: Route) {
    const response = await route.fetch();
    const [topResult]: { title: string; href: string }[] = await response.json();
    await route.fulfill({ response });
    if (!topResult) {
        throw new Error('The search answer has no results');
    }
    return topResult;
}

/**
 * Build a page result for a search answer given by the test.
 */
function searchPageResult(route: Route, siteSpaceId: string, title: string, path: string) {
    const sitePath = new URL(route.request().url()).pathname.replace('~gitbook/search', '');
    return {
        type: 'page',
        id: `space/${title}`,
        pageId: title,
        spaceId: 'space',
        siteSpaceId,
        title,
        description: '',
        href: `${sitePath}${path}`,
        score: 1,
        rank: 1,
    };
}

const overrideAIInitialState = () => {
    const greeting = document.querySelector('[data-testid="ai-chat-greeting-title"]');
    if (greeting) {
        greeting.textContent = 'Good morning';
    }
};

/**
 * Normalize the non-deterministic content of an AI response before screenshotting,
 * while preserving the surrounding structure (message bubbles, tool/activity
 * summary, response container, suggestion buttons) so visual regressions in the
 * chat chrome are still caught. The actual answer formatting is covered separately
 * by the deterministic page tests, since the AI response renders through the same
 * `DocumentView`.
 *
 * Must run only once the chat is no longer `aria-busy` (the response has fully
 * settled), otherwise React re-renders from late stream events will clobber these
 * mutations. See `waitForAIChatResponse`.
 */
const overrideAIResponse = () => {
    // The user's prompt varies in length; pin it to a fixed string.
    document.querySelectorAll('[data-testid="ai-chat-message-user"]').forEach((userMessage) => {
        userMessage.textContent = '[Replaced message] Chat message sent by the user';
    });

    // The assistant's answer text is non-deterministic; replace the rendered
    // document body while keeping the `.ai-response-document` container.
    document
        .querySelectorAll('[data-testid="ai-chat-message-assistant"] .ai-response-document')
        .forEach((message) => {
            message.innerHTML = '<p>[Replaced message] AI chat response</p>';
        });

    // The "Explored with N tools" activity label varies with the number of tool
    // calls; pin it (the chevron sibling is left intact).
    document.querySelectorAll('[data-testid="ai-chat-activity-summary"]').forEach((summary) => {
        summary.textContent = 'Explored';
    });

    // Follow-up suggestion text varies; pin each label.
    document
        .querySelectorAll('[data-testid="ai-chat-followup-suggestion"]')
        .forEach((suggestion) => {
            suggestion.textContent = 'Follow-up suggestion';
        });
};

const searchTestCases: Test[] = [
    {
        name: 'Search - AI Mode: None - Complete flow',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await expect(page.getByTestId('search-results')).toHaveCount(0); // No pop-up yet because there's no recommended questions.

            // Fill search input, expecting search results
            await searchInput.fill('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible({
                timeout: 10_000,
            });
            const pageResults = await page.getByTestId('search-page-result').all();
            await expect(pageResults.length).toBeGreaterThanOrEqual(1);
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
        run: async (page) => {
            await waitForCookiesDialog(page);
            await page.keyboard.press('ControlOrMeta+K');
            await expect(page.getByTestId('search-input')).toBeFocused();
        },
    },
    {
        name: 'Search - Loading rows cannot be activated',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const heldSearch = await holdSearchRequests(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await page.waitForURL(/[?&]q=/);
            await searchInput.pressSequentially('gitbook');
            await heldSearch('gitbook');

            const searchPopup = page.getByTestId('search-popover');
            await expect(searchPopup.locator('[aria-busy="true"]').first()).toBeVisible();
            await expect(searchPopup.getByTestId('search-page-result')).toHaveCount(0);
            await expect(searchPopup.getByRole('link')).toHaveCount(0);
        },
    },
    {
        name: 'Search - Keyboard focus exits to the next page control',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Search,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await searchInput.fill('gitbook');

            const searchPopup = page.getByTestId('search-popover');
            await expect(searchPopup).toBeVisible({ timeout: 10_000 });
            const finalPopupControl = searchPopup
                .locator(
                    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
                .filter({ visible: true })
                .last();
            const nextPageControl = page.getByTestId('table-of-contents').getByRole('link').first();
            await expect(finalPopupControl).toBeVisible();
            await expect(nextPageControl).toBeVisible();
            await finalPopupControl.focus();
            await page.keyboard.press('Tab');
            await expect(searchPopup).toBeHidden();
            await expect(nextPageControl).toBeFocused();

            await page.keyboard.press('Shift+Tab');
            await expect(searchInput).toBeFocused();
        },
    },
    {
        // `fill()` bypasses key events, so it can't catch a swallowed key. RND-12484.
        name: 'Search - AI Mode: None - Typing multi-word queries',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await searchInput.pressSequentially('getting started');
            await expect(searchInput).toHaveValue('getting started');
        },
    },
    {
        name: 'Search - Retry after a failed search sends the query once',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
            header: {
                preset: CustomizationHeaderPreset.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            // Keep the search on the failing route whether or not the site gives search passes.
            await page.route('**/~gitbook/search-pass', (route) => route.fulfill({ status: 204 }));
            let failing = true;
            await page.route('**/~gitbook/search', (route) =>
                failing ? route.fulfill({ status: 500 }) : route.continue()
            );
            const sentQueries: string[] = [];
            page.on('request', (request) => {
                if (request.method() === 'POST' && request.url().endsWith('/~gitbook/search')) {
                    sentQueries.push(request.postDataJSON().query);
                }
            });

            const searchInput = page.getByTestId('search-input').locator('visible=true');
            await searchInput.focus();
            await page.waitForURL(/[?&]q=/);
            await searchInput.pressSequentially('gitbook');
            const retry = page.getByRole('button', { name: 'Try again' }).locator('visible=true');
            await expect(retry).toBeVisible();

            failing = false;
            sentQueries.length = 0;
            await retry.click();
            await expect(searchInput).toHaveValue('gitbook');
            await expect(page.getByTestId('search-results').locator('visible=true')).toBeVisible();
            await page.waitForTimeout(1000);
            expect(sentQueries).toEqual(['gitbook']);
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
            await waitForCookiesDialog(page);
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
            await waitForCookiesDialog(page);
            await expect(page.getByTestId('search-input')).toBeFocused();
            await expect(page.getByTestId('search-input')).toHaveValue('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible();
        },
    },
    {
        name: 'Search - AI Mode: Search - URL query (Results)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Search,
            },
        })}&q=gitbook`,
        run: async (page) => {
            await waitForCookiesDialog(page);
            await expect(page.getByTestId('search-input')).toBeFocused();
            await expect(page.getByTestId('search-input')).toHaveValue('gitbook');
            await expect(page.getByTestId('search-results')).toBeVisible();
        },
    },
    {
        // RND-12844: the popover's focus manager re-focused the closing popup and
        // scrolled the page back to the top right after landing on the section.
        name: 'Search - Section result scrolls to the section',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        }),
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            // Type like a visitor: `fill()` doesn't trigger the remote search.
            await searchInput.pressSequentially('tasks');

            const sectionResult = page.locator(
                '[data-testid="search-page-result"][href$="/blocks/lists#tasks"]'
            );
            // Section results come from the remote index, which can be slow to answer.
            await expect(sectionResult).toBeVisible({ timeout: 30_000 });
            await sectionResult.click();
            await page.waitForURL(/\/blocks\/lists#tasks$/);

            // The regression scrolled back to the top shortly after landing, so let
            // that happen before asserting.
            await page.waitForTimeout(1000);

            // The heading is parked under the header, within its scroll margin.
            const top = await page
                .locator('#tasks')
                .evaluate((heading) => heading.getBoundingClientRect().top);
            expect(top).toBeGreaterThanOrEqual(0);
            expect(top).toBeLessThanOrEqual(150);
        },
    },
    {
        name: 'Search - Enter while results load opens the top result of the last query',
        url: `blocks/lists${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        })}`,
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const heldSearch = await holdSearchRequests(page);
            const startPath = new URL(page.url()).pathname;
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await page.waitForURL(/[?&]q=/);
            await searchInput.pressSequentially('gitbook');
            const firstSearch = await heldSearch('gitbook');
            await searchInput.selectText();
            await searchInput.pressSequentially('files');
            const lastSearch = await heldSearch('files');

            await page.keyboard.press('Enter');
            await answerSearch(firstSearch).catch(() => {});
            await page.waitForTimeout(1000);
            await expect(page.getByTestId('search-popover')).toBeVisible();
            await expect(searchInput).toBeFocused();
            expect(new URL(page.url()).pathname).toBe(startPath);

            const topResult = await answerSearch(lastSearch);
            await expect(
                page.getByRole('heading', { level: 1, name: topResult.title, exact: true })
            ).toBeVisible({ timeout: 20000 });
            expect(new URL(page.url()).pathname).toBe(new URL(topResult.href, page.url()).pathname);
        },
    },
    {
        name: 'Search - Enter opens the visible result while a new query loads',
        url: `blocks/lists${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        })}`,
        screenshot: false,
        run: async (page) => {
            await waitForHydration(page);
            const heldSearch = await holdSearchRequests(page);
            const searchInput = page.getByTestId('search-input');
            const searchPopup = page.getByTestId('search-popover');
            await searchInput.focus();
            await page.waitForURL(/[?&]q=/);
            await searchInput.pressSequentially('gitbook');
            const initialSearch = await heldSearch('gitbook');
            const { siteSpaceId } = initialSearch.request().postDataJSON().scope;
            const topResult = searchPageResult(
                initialSearch,
                siteSpaceId,
                'Headings',
                'blocks/headings'
            );
            await initialSearch.fulfill({ json: [topResult] });
            const firstResult = searchPopup.getByTestId('search-page-result').first();
            await expect(firstResult).toHaveAttribute('href', topResult.href);

            await searchInput.pressSequentially(' docs');
            const pendingSearch = await heldSearch('gitbook docs');
            await expect(searchPopup.locator('output[aria-busy="true"]')).toBeVisible();
            await expect(firstResult).toHaveAttribute('href', topResult.href);
            await expect(searchPopup.locator('[data-search-placeholder-row]')).toHaveCount(0);

            await searchInput.press('Enter');
            await expect(searchPopup).toBeHidden();
            await expect
                .poll(() => new URL(page.url()).pathname)
                .toBe(new URL(topResult.href, page.url()).pathname);
            await pendingSearch.abort().catch(() => {});
        },
    },
    {
        name: 'Search - Enter opens the result under the mouse',
        url: `blocks/lists${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.None,
            },
        })}`,
        screenshot: false,
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.getByTestId('search-input');
            await searchInput.focus();
            await searchInput.pressSequentially('gitbook');

            const searchPopup = page.getByTestId('search-popover');
            const hovered = searchPopup.getByTestId('search-page-result').nth(1);
            await hovered.hover();
            await expect(hovered).toHaveClass(/is-active/);
            await expect(searchPopup.locator('[role="option"].is-active')).toHaveCount(1);

            const href = await hovered.getAttribute('href');
            await page.keyboard.press('Enter');
            await expect
                .poll(() => new URL(page.url()).pathname, { timeout: 20000 })
                .toBe(new URL(href ?? '', page.url()).pathname);
        },
    },
    {
        name: 'Ask - AI Mode: Assistant - Complete flow',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        run: async (page) => {
            await waitForCookiesDialog(page);
            const searchInput = page.locator('css=[data-testid="search-input"]');

            // Fill search input, expecting AI search option
            await searchInput.focus();
            await searchInput.fill(AI_PROMPT);
            const aiSearchResult = page.getByTestId('search-ask-question');
            await expect(aiSearchResult).toBeVisible();
            await aiSearchResult.click();
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-message-user').first()).toHaveText(AI_PROMPT);
            await expect(page.getByTestId('ai-chat-message-assistant').first()).toBeVisible();
            // Wait for the stream, follow-up phase included, to finish before screenshotting.
            // Follow-ups aren't asserted: the API can return none for this prompt.
            await waitForAIChatResponse(page);
        },
        // Re-applied per viewport so the replacement survives resize-driven re-renders.
        normalizeBeforeScreenshot: (page) => page.evaluate(overrideAIResponse),
    },
    {
        name: 'Ask - AI Mode: Assistant - Keyboard shortcut',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        run: async (page) => {
            await waitForCookiesDialog(page);
            await page.keyboard.press('ControlOrMeta+I');
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
        // Re-applied per viewport so the replacement survives resize-driven re-renders.
        normalizeBeforeScreenshot: (page) => page.evaluate(overrideAIInitialState),
    },
    {
        name: 'Ask - AI Mode: Assistant - Button',
        url: getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        }),
        run: async (page) => {
            await waitForCookiesDialog(page);
            await page.getByTestId('ai-chat-button').click();
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
        // Re-applied per viewport so the replacement survives resize-driven re-renders.
        normalizeBeforeScreenshot: (page) => page.evaluate(overrideAIInitialState),
    },
    {
        name: 'Ask - AI Mode: Assistant - URL query (Initial)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        })}&ask=`,
        run: async (page) => {
            await waitForCookiesDialog(page);
            await expect(page.getByTestId('search-input')).not.toBeFocused();
            await expect(page.getByTestId('search-input')).toBeEmpty();
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-input')).toBeFocused();
        },
        // Re-applied per viewport so the replacement survives resize-driven re-renders.
        normalizeBeforeScreenshot: (page) => page.evaluate(overrideAIInitialState),
    },
    {
        name: 'Ask - AI Mode: Assistant - URL query (Results)',
        url: `${getCustomizationURL({
            ai: {
                mode: CustomizationAIMode.Assistant,
            },
        })}&ask=${encodeURIComponent(AI_PROMPT)}`,
        run: async (page) => {
            await waitForCookiesDialog(page);
            await expect(page.getByTestId('search-input')).not.toBeFocused();
            await expect(page.getByTestId('search-input')).not.toHaveValue('What is GitBook?');
            await expect(page.getByTestId('ai-chat')).toBeVisible();
            await expect(page.getByTestId('ai-chat-message-user').first()).toHaveText(AI_PROMPT);
            await expect(page.getByTestId('ai-chat-message-assistant').first()).toBeVisible();
            // Wait for the stream, follow-up phase included, to finish before screenshotting.
            // Follow-ups aren't asserted: the API can return none for this prompt.
            await waitForAIChatResponse(page);
        },
        // Re-applied per viewport so the replacement survives resize-driven re-renders.
        normalizeBeforeScreenshot: (page) => page.evaluate(overrideAIResponse),
    },
];

const SEARCH_API_URL = /\/v1\/orgs\/[^/]+\/sites\/[^/]+\/search$/;
const SEARCH_PASS_RECORD = {
    type: 'record',
    id: 'search-pass-record',
    title: 'Answered by the search API',
    description: 'A search made with a search pass',
    url: 'https://example.com/search-pass',
    score: 1,
};

/**
 * Answer the page's search pass requests as the API does when passes are switched on.
 */
async function giveSearchPasses(page: Page, lifetimesMs: number[] = []) {
    let passes = 0;
    await page.route('**/~gitbook/search-pass', async (route) => {
        passes += 1;
        await route.fulfill({
            json: {
                token: `test-search-pass-${passes}`,
                expiresIn: lifetimesMs.shift() ?? 300_000,
            },
        });
    });
}

/**
 * Answer each search API call with the next status, and with a record when it succeeds.
 */
async function answerSearchAPI(page: Page, statuses: number[] = []) {
    const calls: Request[] = [];
    await page.route(SEARCH_API_URL, async (route) => {
        calls.push(route.request());
        const status = statuses.shift() ?? 200;
        await route.fulfill({
            status,
            headers: { 'access-control-allow-origin': '*' },
            json: status === 200 ? { items: [SEARCH_PASS_RECORD] } : { error: { code: status } },
        });
    });
    return calls;
}

/**
 * Collect the searches the page sends to the site's search route.
 */
function trackRouteSearches(page: Page) {
    const searches: Request[] = [];
    page.on('request', (request) => {
        if (request.method() === 'POST' && request.url().endsWith('/~gitbook/search')) {
            searches.push(request);
        }
    });
    return searches;
}

/**
 * Open search and wait for the page to receive its search pass.
 */
async function openSearchWithPass(page: Page) {
    const passReply = page.waitForResponse('**/~gitbook/search-pass');
    await page.getByTestId('search-input').focus();
    await passReply;
}

async function typeSearch(page: Page, text: string) {
    const searchInput = page.getByTestId('search-input');
    await searchInput.focus();
    await searchInput.pressSequentially(text);
}

const searchPassTestCases: Test[] = [
    {
        name: 'No pass: searches go through the site route',
        url: '',
        screenshot: false,
        run: async (page) => {
            await page.route('**/~gitbook/search-pass', (route) => route.fulfill({ status: 204 }));
            const passReply = page.waitForResponse('**/~gitbook/search-pass');
            const apiCalls: Request[] = [];
            page.on('request', (request) => {
                if (SEARCH_API_URL.test(request.url())) {
                    apiCalls.push(request);
                }
            });
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await typeSearch(page, 'gitbook');
            expect((await passReply).status()).toBe(204);
            await expect
                .poll(() => routeSearches.length, { timeout: 30_000 })
                .toBeGreaterThanOrEqual(1);
            expect((await routeSearches[0]?.response())?.status()).toBe(200);
            expect(apiCalls).toHaveLength(0);
        },
    },
    {
        name: 'With a pass: searches go straight to the API',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const apiCalls = await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect(
                page
                    .getByTestId('search-record-result')
                    .filter({ hasText: SEARCH_PASS_RECORD.title })
            ).toBeVisible({ timeout: 30_000 });
            expect((await apiCalls[0]?.allHeaders())?.authorization).toBe(
                'Bearer test-search-pass-1'
            );
            expect(routeSearches).toHaveLength(0);
        },
    },
    {
        name: 'Expired pass: the search uses the route, then the next pass searches the API',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page, [1_000]);
            const apiCalls = await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            expect(routeSearches[0]?.headers()['x-gitbook-search-fallback']).toBe('expired');
            expect(apiCalls).toHaveLength(0);

            await typeSearch(page, ' editor');
            await expect(
                page
                    .getByTestId('search-record-result')
                    .filter({ hasText: SEARCH_PASS_RECORD.title })
            ).toBeVisible({ timeout: 30_000 });
            expect((await apiCalls[0]?.allHeaders())?.authorization).toBe(
                'Bearer test-search-pass-2'
            );
        },
    },
    {
        name: 'Refused pass: the page stays on the route',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const apiCalls = await answerSearchAPI(page, [403]);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            await typeSearch(page, ' editor');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(2);

            expect(
                routeSearches.map((request) => request.headers()['x-gitbook-search-fallback'])
            ).toEqual(['403', '403']);
            expect(apiCalls).toHaveLength(1);
            expect((await routeSearches.at(-1)?.response())?.status()).toBe(200);
        },
    },
    {
        name: 'Dropped API request: the search falls back to the route after its time limit',
        url: '',
        screenshot: false,
        run: async (page) => {
            await page.clock.install();
            await giveSearchPasses(page);
            const apiCalls: Request[] = [];
            await page.route(SEARCH_API_URL, (route) => {
                apiCalls.push(route.request());
            });
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(1);
            await page.clock.fastForward(5_000);
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            expect(routeSearches[0]?.headers()['x-gitbook-search-fallback']).toBe('timeout');
            expect((await routeSearches[0]?.response())?.status()).toBe(200);

            await typeSearch(page, ' editor');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(2);
            expect(apiCalls).toHaveLength(1);
        },
    },
    {
        name: 'Withdrawn pass: a no-pass reply stops the page using the earlier pass',
        url: '',
        screenshot: false,
        run: async (page) => {
            let passReplies = 0;
            await page.route('**/~gitbook/search-pass', async (route) => {
                passReplies += 1;
                await (passReplies === 1
                    ? route.fulfill({ json: { token: 'test-search-pass-1', expiresIn: 300_000 } })
                    : route.fulfill({ status: 204 }));
            });
            const apiCalls = await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect(
                page
                    .getByTestId('search-record-result')
                    .filter({ hasText: SEARCH_PASS_RECORD.title })
            ).toBeVisible({ timeout: 30_000 });

            await page.keyboard.press('Escape');
            await openSearchWithPass(page);
            await typeSearch(page, ' editor');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            expect(apiCalls).toHaveLength(1);
        },
    },
    {
        name: 'Rejected replacement pass: the page stays on the route after one refresh',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const passRequests: Request[] = [];
            page.on('request', (request) => {
                if (request.url().endsWith('/~gitbook/search-pass')) {
                    passRequests.push(request);
                }
            });
            const apiCalls = await answerSearchAPI(page, [401, 401, 401, 401]);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            for (const [index, text] of ['gitbook', ' editor', ' blocks', ' lists'].entries()) {
                await typeSearch(page, text);
                await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(index + 1);
                await page.waitForTimeout(500);
            }

            expect(apiCalls).toHaveLength(2);
            expect(passRequests).toHaveLength(2);
        },
    },
    {
        name: 'Rate limited: the next query waits for the cooldown before using the route',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const apiCalls = await answerSearchAPI(page, [429]);
            const routeSearchTimes: number[] = [];
            page.on('request', (request) => {
                if (request.method() === 'POST' && request.url().endsWith('/~gitbook/search')) {
                    routeSearchTimes.push(Date.now());
                }
            });
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            const rateLimited = page.waitForResponse(SEARCH_API_URL);
            await typeSearch(page, 'gitbook');
            await rateLimited;
            const rateLimitedAt = Date.now();
            await typeSearch(page, ' editor');

            await expect.poll(() => routeSearchTimes.length, { timeout: 30_000 }).toBe(1);
            expect(routeSearchTimes[0]! - rateLimitedAt).toBeGreaterThanOrEqual(1_500);
            expect(apiCalls).toHaveLength(1);
        },
    },
    {
        name: 'Renewing pass: a search typed before the reply goes to the route',
        url: '',
        screenshot: false,
        run: async (page) => {
            let releaseRenewal = () => {};
            const renewalHeld = new Promise<void>((resolve) => {
                releaseRenewal = resolve;
            });
            let passReplies = 0;
            await page.route('**/~gitbook/search-pass', async (route) => {
                passReplies += 1;
                if (passReplies === 1) {
                    await route.fulfill({
                        json: { token: 'test-search-pass-1', expiresIn: 300_000 },
                    });
                    return;
                }
                await renewalHeld;
                await route.fulfill({ status: 204 }).catch(() => undefined);
            });
            const apiCalls = await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(1);

            await page.keyboard.press('Escape');
            const renewal = page.waitForRequest('**/~gitbook/search-pass');
            await typeSearch(page, ' editor');
            await renewal;
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            expect(apiCalls).toHaveLength(1);
            releaseRenewal();
        },
    },
    {
        name: 'Rate limited by a shared limit: searches fail at once until its reset',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const apiCalls: Request[] = [];
            await page.route(SEARCH_API_URL, async (route) => {
                apiCalls.push(route.request());
                await route.fulfill({
                    status: 429,
                    headers: {
                        'access-control-allow-origin': '*',
                        'access-control-expose-headers': 'x-ratelimit-reset, x-ratelimit-scope',
                        'x-ratelimit-reset': String(Math.ceil(Date.now() / 1000) + 60),
                        'x-ratelimit-scope': 'tenant-operation',
                    },
                    json: { error: { code: 429 } },
                });
            });
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(1);
            await typeSearch(page, ' editor');
            await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible({
                timeout: 30_000,
            });
            await page.waitForTimeout(3_000);
            expect(routeSearches).toHaveLength(0);
            expect(apiCalls).toHaveLength(1);
        },
    },
    {
        name: 'Cancelled search: a late API answer never replaces the newer query',
        url: '',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            const staleTitle = 'Late answer for an older query';
            await page.route(SEARCH_API_URL, async (route) => {
                const { query } = route.request().postDataJSON() as { query: string };
                const stale = query === 'gitbook';
                if (stale) {
                    await page.waitForTimeout(3_000);
                }
                await route
                    .fulfill({
                        headers: { 'access-control-allow-origin': '*' },
                        json: {
                            items: [
                                stale
                                    ? { ...SEARCH_PASS_RECORD, title: staleTitle }
                                    : SEARCH_PASS_RECORD,
                            ],
                        },
                    })
                    .catch(() => undefined);
            });
            const routeSearches = trackRouteSearches(page);
            await waitForCookiesDialog(page);

            const firstSearch = page.waitForRequest(
                (request) =>
                    SEARCH_API_URL.test(request.url()) &&
                    (request.postDataJSON() as { query: string }).query === 'gitbook'
            );
            await openSearchWithPass(page);
            await typeSearch(page, 'gitbook');
            await firstSearch;
            await typeSearch(page, ' editor');

            await expect(
                page
                    .getByTestId('search-record-result')
                    .filter({ hasText: SEARCH_PASS_RECORD.title })
            ).toBeVisible({ timeout: 30_000 });
            await page.waitForTimeout(4_000);
            await expect(page.getByText(staleTitle)).toHaveCount(0);
            expect(routeSearches).toHaveLength(0);
        },
    },
    {
        name: 'Embedded search goes straight to the API',
        url: '~gitbook/embed/search',
        screenshot: false,
        run: async (page) => {
            await giveSearchPasses(page);
            await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            // The embedded page keeps <html> hidden, so wait for hydration without visibility.
            await page.locator('html.hydrated').waitFor({ state: 'attached' });

            // The embedded search opens on the first key; a one-letter query is never sent.
            const passReply = page.waitForResponse('**/~gitbook/search-pass');
            await typeSearch(page, 'g');
            await passReply;
            await typeSearch(page, 'itbook');
            await expect(
                page
                    .getByTestId('search-record-result')
                    .filter({ hasText: SEARCH_PASS_RECORD.title })
            ).toBeVisible({ timeout: 30_000 });
            // The one-letter query can reach the route when it is sent before the pass arrives.
            const routeQueries = routeSearches.map((request) => request.postDataJSON().query);
            expect(routeQueries).not.toContain('gitbook');
        },
    },
];

const VISITOR_AUTH_SITE = 'https://gitbook.gitbook.io/gbo-va-space/';

function signVisitorToken(name: string) {
    return jwt.sign({ name }, '70b844d0-c519-4532-8586-5970ce48c537', { expiresIn: '24h' });
}

/**
 * Give the page one search pass, then answer later pass requests with `later` or the site's route.
 */
async function giveOneSearchPass(page: Page, later?: { token: string }) {
    let passes = 0;
    await page.route('**/~gitbook/search-pass', async (route) => {
        passes += 1;
        if (passes > 1 && !later) {
            await route.continue();
            return;
        }
        await route.fulfill({
            json: {
                token: passes === 1 ? 'test-search-pass-1' : later?.token,
                expiresIn: 300_000,
            },
        });
    });
}

/**
 * Open a second tab of the site at `path`, keeping it from leaving for an upstream sign-in page.
 */
async function visitInOtherTab(page: Page, path: string) {
    const other = await page.context().newPage();
    await other.route(
        (url) => url.hostname !== new URL(page.url()).hostname,
        (route) => route.abort()
    );
    await other.goto(getContentTestURL(new URL(path, VISITOR_AUTH_SITE).href), {
        waitUntil: 'commit',
    });
    await other.close();
}

/**
 * Close search and open it again, waiting for the pass request that opening sends.
 */
async function reopenSearch(page: Page) {
    await page.keyboard.press('Escape');
    const passReply = page.waitForResponse('**/~gitbook/search-pass');
    await page.getByTestId('search-input').focus();
    return passReply;
}

const searchPassSessionTestCases: Test[] = [
    {
        name: 'Signed out in another tab: reopening search drops the pass',
        url: () => `first?jwt_token=${signVisitorToken('gitbook-open-tests')}`,
        screenshot: false,
        run: async (page) => {
            await giveOneSearchPass(page);
            const apiCalls = await answerSearchAPI(page);
            const routeSearches = trackRouteSearches(page);
            await waitForHydration(page);
            await openSearchWithPass(page);
            await typeSearch(page, 'first');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(1);

            await visitInOtherTab(page, '~gitbook/auth/logout');
            await expect
                .poll(async () =>
                    (await page.context().cookies()).some((cookie) =>
                        cookie.name.startsWith(VISITOR_TOKEN_COOKIE)
                    )
                )
                .toBe(false);

            expect((await reopenSearch(page)).status()).toBe(401);
            await typeSearch(page, ' page');
            await expect.poll(() => routeSearches.length, { timeout: 30_000 }).toBe(1);
            expect(apiCalls).toHaveLength(1);
        },
    },
    {
        name: 'Signed in as another visitor in another tab: reopening search uses the new pass',
        url: () => `first?jwt_token=${signVisitorToken('gitbook-open-tests')}`,
        screenshot: false,
        run: async (page) => {
            await giveOneSearchPass(page, { token: 'test-search-pass-2' });
            const apiCalls = await answerSearchAPI(page);
            await waitForHydration(page);
            await openSearchWithPass(page);
            await typeSearch(page, 'first');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(1);

            const otherVisitor = signVisitorToken('another-visitor');
            await visitInOtherTab(page, `first?jwt_token=${otherVisitor}`);

            const passReply = await reopenSearch(page);
            expect((await passReply.request().allHeaders()).cookie).toContain(otherVisitor);
            await typeSearch(page, ' page');
            await expect.poll(() => apiCalls.length, { timeout: 30_000 }).toBe(2);
            expect((await apiCalls[1]?.allHeaders())?.authorization).toBe(
                'Bearer test-search-pass-2'
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
                    await waitForCookiesDialog(page);
                    await expect(page.locator('[data-testid="space-dropdown-button"]')).toHaveCount(
                        0
                    );
                },
            },
            {
                name: 'Expandable TOC navigation',
                url: '',
                run: async (page) => {
                    await waitForCookiesDialog(page);

                    // Verify "Navigation" link is not visible initially
                    const navigationLink = page.getByRole('link', { name: 'Navigation' });
                    await expect(navigationLink).not.toBeVisible();

                    // Find and click the chevron element that is next to "Editor" in the TOC
                    // It is a button inside the link
                    const editorChevron = page
                        .getByRole('link', { name: 'Editor' })
                        .locator('button');
                    await editorChevron.click();

                    // Verify "Navigation" link becomes visible after expansion
                    await expect(navigationLink).toBeVisible();
                },
            },
            {
                name: 'Expandable nested TOC navigation',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForCookiesDialog(page);

                    // Verify "Spaces" link is not visible initially
                    const navigationLink = page.getByRole('link', { name: 'Spaces' });
                    await expect(navigationLink).not.toBeVisible();

                    // Find and click the chevron element that is next to "Editor" in the TOC
                    // It is a button inside the link
                    const editorChevron = page
                        .getByRole('link', { name: 'Editor' })
                        .locator('button');
                    await editorChevron.click();

                    // At this stage the link should still not be visible
                    await expect(navigationLink).not.toBeVisible();

                    // Then we click 'Content Structure' chevron to expand further
                    const contentStructureChevron = page
                        .getByRole('link', { name: 'Content Structure' })
                        .locator('button');
                    await contentStructureChevron.click();

                    // Verify "Spaces" link becomes visible after expansion
                    await expect(navigationLink).toBeVisible();
                },
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
                name: 'Search scope change while loading shows the new answer in server order',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const heldSearch = await holdSearchRequests(page);
                    const searchInput = page.getByTestId('search-input');
                    await searchInput.focus();
                    await page.waitForURL(/[?&]q=/);
                    await searchInput.pressSequentially('quick');
                    const variantSearch = await heldSearch('quick');

                    const searchPopup = page.getByTestId('search-popover');
                    await searchPopup.getByRole('button', { name: 'Multi-Variants' }).click();
                    await page.getByRole('menuitem', { name: /All content/ }).click();
                    const allContentSearch = await heldSearch('quick');

                    const variantScope = variantSearch.request().postDataJSON().scope;
                    expect(allContentSearch.request().postDataJSON().scope).not.toEqual(
                        variantScope
                    );
                    const { siteSpaceId } = variantScope;
                    await allContentSearch.fulfill({
                        json: [
                            searchPageResult(allContentSearch, siteSpaceId, 'Welcome!', ''),
                            searchPageResult(
                                allContentSearch,
                                siteSpaceId,
                                'Quick Start',
                                'quick-start'
                            ),
                        ],
                    });
                    await variantSearch
                        .fulfill({
                            json: [
                                searchPageResult(
                                    variantSearch,
                                    siteSpaceId,
                                    'Quick Start',
                                    'quick-start'
                                ),
                            ],
                        })
                        .catch(() => {});

                    const results = searchPopup.getByTestId('search-page-result');
                    await expect(results).toHaveText([/Welcome!/, /Quick Start/]);
                    await page.waitForTimeout(1000);
                    await expect(results).toHaveText([/Welcome!/, /Quick Start/]);
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
                    await waitForHydration(page);
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
            {
                name: 'Switch variant with alternate link in metadata',
                url: 'rfcs',
                run: async (page) => {
                    await waitForHydration(page);
                    const spaceDropdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );

                    // Click the variant space called 'Multi-Variants' for which
                    // there is an alternate link in the current (RFC variant) page metadata
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: 'Multi-Variants',
                        })
                        .click();

                    // It should navigate to the alternate link defined in the metadata (a completely different page)
                    await page.waitForURL((url) =>
                        url.pathname.includes('multi-variants/reference/api-reference/pets')
                    );
                    // Verify we are on the correct page by checking the h1
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Pets' })
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
                name: 'Strip fallback after loading a page without adding history',
                url: 'api-multi-versions/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const previousURL = page.url();
                    const targetURL = new URL(previousURL);
                    targetURL.searchParams.set('fallback', 'true');
                    targetURL.searchParams.set('ref', 'variant');
                    targetURL.hash = 'pets';
                    await page.goto(targetURL.toString());
                    targetURL.searchParams.delete('fallback');
                    await expect(page).toHaveURL(targetURL.toString());
                    await page.goBack();
                    await expect(page).toHaveURL(previousURL);
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (Public)',
                url: 'api-multi-versions/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
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
                    await page.waitForURL(
                        (url) =>
                            url.pathname.includes(
                                'api-multi-versions/2.0/reference/api-reference/pets'
                            ) && !url.searchParams.has('fallback')
                    );
                },
            },
            {
                name: 'Keep navigation path/route when switching variant (Share link)',
                url: 'api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/reference/api-reference/pets',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
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
                    await waitForHydration(page);
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
        name: 'Language Site (Navigation when switching language variant)',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/yjs/',
        tests: [
            {
                name: 'Should resolve to the same page in the new language variant when switching language variant (Source English -> Target Dutch)',
                url: 'ecosystem/connection-provider',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const spaceDropdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );
                    // Click the dutch language variant in the dropdown
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: 'Yjs (NL)',
                        })
                        .click();

                    // It should keep the current page path, i.e "ecosysteem/connection-provider" when navigating to the NL variant
                    await page.waitForURL((url) =>
                        url.pathname.includes('nl/ecosysteem/connection-provider')
                    );
                    // Verify we are on the correct page by checking the h1
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Connectieprovider' })
                    ).toBeVisible();
                },
            },
            {
                name: 'Should resolve to the same page in the new language variant when switching language variant (Source Dutch -> Target Finnish)',
                url: 'nl/ecosysteem/connection-provider',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const spaceDropdown = page
                        .locator('[data-testid="space-dropdown-button"]')
                        .locator('visible=true');
                    await spaceDropdown.click();

                    const variantSelectionDropdown = page.locator(
                        'css=[data-testid="dropdown-menu"]'
                    );
                    // Click the finnish language variant in the dropdown
                    await variantSelectionDropdown
                        .getByRole('menuitem', {
                            name: 'Yjs (FI)',
                        })
                        .click();

                    // It should keep the current page path, i.e "ecosysteem/connection-provider" when navigating to the FI variant
                    await page.waitForURL((url) =>
                        url.pathname.includes('fi/ekosysteemi/connection-provider')
                    );
                    // Verify we are on the correct page by checking the h1
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Yhteysvälittäjä' })
                    ).toBeVisible();
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
                name: 'Section group link',
                url: '',
                screenshot: false,
                run: async (page) => {
                    // The menu only opens on `mouseenter`, which cannot fire again once the pointer
                    // is inside: a hover landing before hydration is lost for good.
                    await waitForHydration(page);
                    const trigger = page
                        .locator('[data-gb-sections]')
                        .getByRole('button', { name: 'Test Section Group 1' });
                    await trigger.hover();
                    await expect(page.getByText('Section B')).toBeVisible();
                    await page.getByText('Section B').click();
                    await page.waitForURL((url) => url.pathname.includes('/sections/sections-4'));
                },
            },
            {
                name: 'Root external link renders in the configured position',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const rootSections = page.locator('[data-gb-sections]');
                    const rootItems = rootSections.locator(':scope > li');

                    await expect(rootItems).toHaveCount(4);
                    await expect(rootItems.nth(0)).toContainText('Home');
                    await expect(rootItems.nth(1)).toContainText('Test Section Group 1');
                    await expect(rootItems.nth(2)).toContainText('Test Section Group 2');
                    await expect(rootItems.last()).toContainText('Gitbook Docs');
                    await expect(
                        rootSections.getByRole('link', { name: 'Gitbook Docs' })
                    ).toBeVisible();
                },
            },
            {
                name: 'Root external link has the configured contract',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    const rootLink = page
                        .locator('[data-gb-sections]')
                        .getByRole('link', { name: 'Gitbook Docs' });

                    await expect(rootLink).toBeVisible();
                    await expect(rootLink).toHaveAttribute('href', 'https://gitbook.com/docs');
                    await expect(rootLink).not.toHaveAttribute('target');
                    await expect(rootLink).not.toHaveAttribute('rel');
                    await expect(rootLink).toHaveAttribute('data-active', 'false');
                    await expect(rootLink).not.toHaveAttribute('aria-current');
                },
            },
            {
                name: 'Nested external link renders in the configured position',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    await page
                        .locator('[data-gb-sections]')
                        .getByRole('button', { name: 'Test Section Group 2' })
                        .hover();

                    const nestedLink = page.getByRole('link', { name: 'Gitbook Site' });
                    await expect(nestedLink).toBeVisible();

                    const nestedItems = nestedLink
                        .locator('xpath=ancestor::ul[1]')
                        .locator(':scope > li');
                    await expect(nestedItems).toHaveCount(3);
                    await expect(nestedItems.nth(0)).toContainText('Section C');
                    await expect(nestedItems.nth(1)).toContainText('Section with longer title');
                    await expect(nestedItems.last()).toContainText('Gitbook Site');
                },
            },
            {
                name: 'Nested external link has the configured contract',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);
                    await page
                        .locator('[data-gb-sections]')
                        .getByRole('button', { name: 'Test Section Group 2' })
                        .hover();

                    const nestedLink = page.getByRole('link', { name: 'Gitbook Site' });
                    await expect(nestedLink).toBeVisible();
                    await expect(nestedLink).toHaveAttribute('href', 'https://gitbook.com');
                    await expect(nestedLink).not.toHaveAttribute('target');
                    await expect(nestedLink).not.toHaveAttribute('rel');
                    await expect(nestedLink).not.toHaveAttribute('aria-current');
                },
            },
            {
                name: 'External links navigate natively in the current tab',
                url: '',
                screenshot: false,
                run: async (page) => {
                    await waitForHydration(page);

                    await page.route('https://gitbook.com/**', (route) =>
                        route.fulfill({ status: 200, contentType: 'text/html', body: '' })
                    );
                    const popups: string[] = [];
                    page.on('popup', (popup) => popups.push(popup.url()));

                    await page
                        .locator('[data-gb-sections]')
                        .getByRole('link', { name: 'Gitbook Docs' })
                        .click();
                    await expect(page).toHaveURL('https://gitbook.com/docs');

                    await page.goBack();
                    await waitForHydration(page);
                    await page
                        .locator('[data-gb-sections]')
                        .getByRole('button', { name: 'Test Section Group 2' })
                        .hover();
                    await page.getByRole('link', { name: 'Gitbook Site' }).click();
                    await expect(page).toHaveURL('https://gitbook.com/');

                    expect(popups).toEqual([]);
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
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    // Viewing a past revision shows the admin toolbar; assert it is
                    // present (it is hidden from the screenshot as it animates open).
                    await waitForAdminToolbar(page);
                },
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
            {
                name: 'Show error when missing token',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    // Intentionally not setting the token to test error handling when the token is missing
                    const searchParams = new URLSearchParams();
                    searchParams.set('limit', '10');

                    return `~space/${data.space}/~gitbook/pdf?${searchParams.toString()}`;
                },
                screenshot: false,
                run: async (page, response) => {
                    expect(response).not.toBeNull();
                    expect(response?.status()).toBe(400);
                    await expect(page.getByText('Missing API token')).toBeVisible();
                },
            },
        ],
    },
    {
        name: 'Site Previews',
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

                    return `url/${getGitBookPreviewURL(`${data.site}/?${searchParams.toString()}`)}`;
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

                    return `url/${getGitBookPreviewURL(`${data.site}/?${searchParams.toString()}`)}`;
                },
                screenshot: false,
                run: async (page) => {
                    const sectionTabs = page.getByLabel('Sections');
                    await expect(sectionTabs).toBeVisible();

                    const sectionTabLinks = sectionTabs.getByRole('link');
                    for (const link of await sectionTabLinks.all()) {
                        const href = await link.getAttribute('href');
                        expect(href?.includes('/preview/site_p4Xo4')).toBeTruthy();
                    }
                },
            },
            {
                name: 'With customization cookie',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    const searchParams = new URLSearchParams();
                    searchParams.set('token', data.apiToken);

                    return `url/${getGitBookPreviewURL(`${data.site}/?${searchParams.toString()}`)}`;
                },
                screenshot: false,
                run: async (page) => {
                    await expect(page.locator('[data-testid="table-of-contents"]')).toBeVisible();
                    // Trademark exists by default
                    expect(await page.getByTestId('gb-trademark').count()).toBeGreaterThanOrEqual(
                        1
                    ); // We output 2 trademark buttons that are quite different, and can only determine which one is appropriate based on screen size / CSS. So our check needs to be more lenient than "exactly 1".

                    // Go to another page with the customization query to disable the trademark
                    const pageBlocks = new URL(page.url());
                    pageBlocks.pathname = `${pageBlocks.pathname.replace(/\/$/, '')}/blocks`;
                    pageBlocks.search = getCustomizationURL({
                        trademark: {
                            enabled: false,
                        },
                    }).slice(1);
                    await page.goto(pageBlocks.toString());
                    // No trademark because customization is disabled
                    await expect(page.getByTestId('gb-trademark')).toHaveCount(0);
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Blocks' })
                    ).toBeVisible();

                    const pageBlocksCode = new URL(page.url());
                    pageBlocksCode.pathname = `${pageBlocksCode.pathname.replace(/\/$/, '')}/code`;
                    pageBlocksCode.search = '';
                    await page.goto(pageBlocksCode.toString());
                    // The trademark should not be visible because the cookie is still set,
                    await expect(page.getByTestId('gb-trademark')).toHaveCount(0);
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Code' })
                    ).toBeVisible();
                },
            },
            {
                name: 'Markdown page with theme cookie',
                url: async () => {
                    const data = await getSiteAPIToken(
                        'https://gitbook.gitbook.io/test-gitbook-open/'
                    );

                    const searchParams = new URLSearchParams();
                    searchParams.set('token', data.apiToken);
                    searchParams.set('theme', 'dark');

                    return `url/${getGitBookPreviewURL(`${data.site}/blocks?${searchParams.toString()}`)}`;
                },
                screenshot: false,
                run: async (page) => {
                    // The app opens previews with `?theme=`, which the middleware persists in a cookie.
                    const markdownURL = new URL(page.url());
                    markdownURL.pathname = `${markdownURL.pathname.replace(/\/$/, '')}.md`;
                    markdownURL.search = '';
                    const response = await page.request.get(markdownURL.toString());
                    expect(response.status()).toBe(200);
                    expect(response.headers()['content-type']).toContain('text/markdown');
                },
            },
            {
                name: 'Redirect to app for authentication when missing token',
                url: async () => {
                    const data = await getSiteAPIToken('https://gitbook.com/docs');

                    const searchParams = new URLSearchParams();
                    // Intentionally not setting the token to test redirection for authentication

                    return `url/${getGitBookPreviewURL(`${data.site}/?${searchParams.toString()}`)}`;
                },
                screenshot: false,
                run: async (page) => {
                    await page.waitForURL(
                        (url) =>
                            url.host === 'app.gitbook.com' && url.pathname.includes('/preview/auth')
                    );
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
        name: 'Search & AI',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: searchTestCases,
    },
    {
        name: 'Search pass',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: searchPassTestCases,
    },
    {
        name: 'Search pass with visitor authentication',
        contentBaseURL: VISITOR_AUTH_SITE,
        tests: searchPassSessionTestCases,
    },
    {
        name: 'Content tests',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        fullPage: true,
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
                    const mermaidIframe = page
                        .locator('iframe[title*="mermaid"]')
                        .first()
                        .contentFrame();
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
                run: waitForCookiesDialog,
            },
            {
                name: 'Code',
                url: 'blocks/code',
                fullPage: true,
                run: waitForCookiesDialog,
            },
            {
                name: 'Cards',
                url: 'blocks/cards',
                fullPage: true,
                run: waitForCookiesDialog,
            },
            {
                name: 'Updates',
                url: 'blocks/updates',
                fullPage: true,
                run: waitForCookiesDialog,
            },
            {
                name: 'Math',
                url: 'blocks/math',
                run: async (page) => {
                    await waitForCookiesDialog(page);
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
                run: waitForCookiesDialog,
            },
            {
                name: 'Embeds',
                url: 'blocks/embeds',
                fullPage: true,
                run: waitForCookiesDialog,
            },
            {
                name: 'Page links',
                url: 'blocks/page-links',
                fullPage: true,
                run: waitForCookiesDialog,
            },
            {
                name: 'Annotations',
                url: 'blocks/annotations',
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    await page.waitForSelector('[data-annotation]');
                    await page.click('[data-annotation]');
                },
            },
            {
                name: 'Stepper',
                url: 'blocks/stepper',
                run: waitForCookiesDialog,
            },
            {
                name: 'Columns',
                url: 'blocks/columns',
                run: waitForCookiesDialog,
            },
            {
                name: 'Mermaid',
                url: 'blocks/mermaid',
                run: waitForCookiesDialog,
            },
            {
                name: 'Prompt',
                url: 'blocks/prompt',
                run: waitForCookiesDialog,
            },
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
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    await waitForCoverImages(page);
                },
            },
            {
                name: 'With cover for dark mode',
                url: `page-options/page-with-dark-cover${getCustomizationURL({
                    themes: {
                        default: CustomizationDefaultThemeMode.Dark,
                        toggeable: false,
                    },
                })}`,
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    await waitForCoverImages(page, { darkMode: true });
                },
            },
            {
                name: 'With hero cover',
                url: 'page-options/page-with-hero-cover',
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    await waitForCoverImages(page);
                },
            },
            {
                name: 'With cover and no TOC',
                url: 'page-options/page-with-cover-and-no-toc',
                run: async (page) => {
                    await waitForCookiesDialog(page);
                    await waitForCoverImages(page);
                },
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
                ...allTintColors.flatMap((tint) =>
                    allSidebarBackgroundStyles.flatMap((sidebarStyle) => ({
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
                    }))
                ),
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
            ...allDeprecatedThemePresets.flatMap((preset) =>
                allSidebarBackgroundStyles.flatMap((sidebarStyle) => ({
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
                }))
            ),
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
        name: 'Reusable contents',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/reusable-contents/',
        tests: [
            {
                name: 'All cases',
                url: '',
            },
        ],
    },
    {
        name: 'Edit on Git page actions',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/yjs/',
        tests: [
            {
                name: 'With Edit on Git as the default action',
                url: getCustomizationURL({
                    pageActions: {
                        items: [CustomizationPageActionType.Git],
                    },
                }),
                run: async (page) => {
                    await waitForHydration(page);
                    await expect(
                        page.getByRole('link', { name: 'Edit', exact: true })
                    ).toHaveAttribute(
                        'href',
                        'https://github.com/taranvohra/yjs-docs/tree/main/README.md'
                    );
                },
                screenshot: false,
            },
            {
                name: 'With Edit on Git in the dropdown',
                url: getCustomizationURL({
                    pageActions: {
                        items: [
                            CustomizationPageActionType.Markdown,
                            CustomizationPageActionType.Git,
                        ],
                    },
                }),
                run: async (page) => {
                    await waitForHydration(page);
                    await page.getByRole('button', { name: 'More' }).click();
                    await expect(page.getByRole('menu')).toBeVisible();
                    await expect(
                        page.getByRole('menuitem', { name: 'Edit on GitHub' })
                    ).toHaveAttribute(
                        'href',
                        'https://github.com/taranvohra/yjs-docs/tree/main/README.md'
                    );
                },
                screenshot: false,
            },
            {
                name: 'Without Edit on Git',
                url: getCustomizationURL({
                    pageActions: {
                        items: [CustomizationPageActionType.Markdown],
                    },
                }),
                run: async (page) => {
                    await waitForHydration(page);
                    await page.getByRole('button', { name: 'More' }).click();
                    await expect(page.getByRole('menu')).toBeVisible();
                    await expect(
                        page.getByRole('menuitem', { name: 'Edit on GitHub' })
                    ).toHaveCount(0);
                },
                screenshot: false,
            },
        ],
    },
    {
        name: 'Page actions',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'Without page actions',
                url: getCustomizationURL({
                    pageActions: {
                        items: [],
                    },
                }),
                run: waitForCookiesDialog,
            },
        ],
    },
    {
        name: 'Social links',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/',
        tests: [
            {
                name: 'With social links',
                url: getCustomizationURL({
                    socialAccounts: [
                        {
                            platform: SiteSocialAccountPlatform.Github,
                            display: { footer: true },
                            handle: 'GitbookIO',
                        },
                        {
                            platform: SiteSocialAccountPlatform.Linkedin,
                            display: { footer: true },
                            handle: 'gitbook',
                        },
                        {
                            platform: SiteSocialAccountPlatform.Twitter,
                            display: { footer: false },
                            handle: 'GitBookIO',
                        },
                    ],
                }),
                fullPage: true,
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
                    expect(url.endsWith('/shared')).toBeTruthy(); // correct page
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
                    expect(url.endsWith('/shared')).toBeTruthy(); // correct page
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
                name: 'Basic redirect',
                url: 'a/redirect/to/sso',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('SSO');
                },
                screenshot: false,
            },
            {
                name: 'Complex wildcard with special characters',
                url: 'foo/bar/baz/123456789-welcome-to-gitbook-%22%20target=%22_blank',
                run: async (page) => {
                    await expect(page.locator('h1')).toHaveText('SEO');
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
                    await expect(page.locator('h1')).toContainText('Quickstart');
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
        name: 'Navigation of links on a share links site',
        contentBaseURL: 'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/',
        tests: [
            {
                name: 'Link in same site has the share link token preserved',
                url: '8tNo6MeXg7CkFMzSSz81/link-in-same-site',
                run: async (page) => {
                    const linkToDifferentPage = page.getByRole('link', { name: 'Other Page' });
                    await linkToDifferentPage.click();
                    await page.waitForURL((url) =>
                        url.pathname.includes(
                            '/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/3.0/other-page'
                        )
                    );
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Other Page' })
                    ).toBeVisible();
                },
                screenshot: false,
            },
            {
                name: 'Link to different site should not have the share link token preserved',
                url: '8tNo6MeXg7CkFMzSSz81/link-in-different-site',
                run: async (page) => {
                    const linkToDifferentSite = page.getByRole('link', { name: 'Basics' });
                    await linkToDifferentSite.click();
                    await page.waitForURL(
                        (url) =>
                            url.toString() ===
                            'https://gitbook-open-e2e-sites.gitbook.io/sections/sections-4/basics/editor'
                    );
                    await expect(
                        page.getByRole('heading', { level: 1, name: 'Editor' })
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
        name: 'Visitor Auth - Space (oversized token)',
        contentBaseURL: 'https://gitbook.gitbook.io/gbo-va-space/',
        tests: [
            {
                name: 'Oversized token is chunked into cookies and survives navigation',
                url: () => {
                    const privateKey = '70b844d0-c519-4532-8586-5970ce48c537';
                    const token = jwt.sign(
                        {
                            name: 'gitbook-open-tests',
                            // Inflate the token above the ~4KB browser cookie limit,
                            // like an IdP issuing many group claims would.
                            groups: Array.from(
                                { length: 60 },
                                (_, index) => `group-${index}-${'x'.repeat(80)}`
                            ),
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

                    // The token must be persisted as a chunk-count marker plus chunk cookies.
                    const cookies = await page.context().cookies();
                    // Next.js percent-encodes cookie values, so the raw value is `chunks%3A2`.
                    const marker = cookies.find(
                        (cookie) =>
                            cookie.name.startsWith(VISITOR_TOKEN_COOKIE) &&
                            /^chunks(:|%3A)\d+$/.test(cookie.value)
                    );
                    expect(marker).toBeDefined();
                    const chunks = cookies.filter((cookie) =>
                        cookie.name.startsWith(`${marker?.name}-`)
                    );
                    expect(chunks.length).toBeGreaterThanOrEqual(2);

                    // Navigating without the token must authenticate from the chunked cookie.
                    // `first` is the space's default page, so the post-sign-in redirect
                    // canonicalizes to the space root: derive `second` from that base.
                    const secondURL = new URL(page.url());
                    const basePathname = secondURL.pathname
                        .replace(/\/first\/?$/, '')
                        .replace(/\/$/, '');
                    secondURL.pathname = `${basePathname}/second`;
                    secondURL.search = '';
                    // Same reason as the harness navigation: third-party subresources on
                    // this site can hang and never fire `load`.
                    await page.goto(secondURL.toString(), { waitUntil: 'domcontentloaded' });
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
            // This test does not work on Playwright
            // Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
            // @see https://github.com/microsoft/playwright/issues/34889
            // {
            //     name: 'Redirect to fallback on invalid token pulled from cookie',
            //     url: '',
            //     screenshot: false,
            //     cookies: (() => {
            //         const basePath = '/va-site-redirects-fallback/';
            //         const invalidToken = jwt.sign(
            //             {
            //                 name: 'gitbook-open-tests',
            //             },
            //             'invalidKey',
            //             {
            //                 expiresIn: '24h',
            //             }
            //         );
            //         return [
            //             {
            //                 name: getVisitorAuthCookieName(basePath),
            //                 value: getVisitorAuthCookieValue(basePath, invalidToken),
            //                 httpOnly: true,
            //             },
            //         ];
            //     })(),
            //     run: async (page) => {
            //         await expect(page).toHaveURL(/https:\/\/www.google.com/);
            //     },
            // },
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
            run: waitForCookiesDialog,
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
    {
        name: 'Docs Embed - Basic',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/~gitbook/embed/demo/',
        tests: [
            {
                name: 'Standalone UX',
                url: '',
                run: async (page) => {
                    const button = page.locator('#gitbook-widget-button');
                    await expect(button).toBeVisible();
                    await expect(button.locator('#gitbook-widget-button-label')).toHaveText('Ask');
                    await expect(button.locator('#gitbook-widget-button-icon')).toHaveAttribute(
                        'data-icon',
                        'assistant'
                    );

                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    await button.click(); // Toggle the window off for the screenshot
                    await expect(page.locator('#gitbook-widget-window')).not.toBeVisible();
                },
            },
            {
                name: 'Change standalone button label and icon',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            button: {
                                label: 'Docs',
                                icon: 'book',
                            },
                        });
                    });
                    const button = page.locator('#gitbook-widget-button');
                    await expect(button).toBeVisible();
                    button.click();
                    await expect(page.locator('#gitbook-widget-window')).not.toBeVisible();
                    await expect(page.locator('#gitbook-widget-button-label')).toHaveText('Docs');
                    await expect(page.locator('#gitbook-widget-button-icon')).toHaveAttribute(
                        'data-icon',
                        'book'
                    );
                },
            },
            {
                name: 'Only tracks ask_view once the widget is opened',
                // `trigger=custom` loads the frame but leaves the window closed.
                url: '?trigger=custom',
                screenshot: false,
                run: async (page) => {
                    const askViews = trackInsightsEvents(page, 'ask_view');
                    const chat = page.frameLocator('#gitbook-widget-iframe').getByTestId('ai-chat');

                    // The assistant renders inside the hidden frame, but nobody has seen it.
                    await expect(chat).toBeAttached({ timeout: 20000 });
                    await page.waitForTimeout(INSIGHTS_FLUSH_TIMEOUT);
                    expect(askViews).toHaveLength(0);

                    await page.getByRole('button', { name: 'Open' }).click();
                    await expect(chat).toBeVisible();
                    await expect.poll(() => askViews.length, { timeout: 20000 }).toBe(1);

                    // Hiding and showing the same frame again is not a second view.
                    await page.getByRole('button', { name: 'Close' }).click();
                    await expect(chat).toBeHidden();
                    await page.getByRole('button', { name: 'Open' }).click();
                    await expect(chat).toBeVisible();
                    await page.waitForTimeout(INSIGHTS_FLUSH_TIMEOUT);
                    expect(askViews).toHaveLength(1);
                },
            },
        ],
    },
    {
        name: 'Docs Embed - Assistant + Docs',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/~gitbook/embed/demo/',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        tests: [
            {
                name: 'Switch between tabs',
                url: '',
                run: async (page) => {
                    await setTimeToMorning(page);
                    await page.reload();
                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await iframe.getByTestId('embed-tab-docs').click(); // Switch to docs tab
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible({
                        timeout: 20000,
                    });

                    await iframe.getByTestId('embed-tab-assistant').click(); // Switch to assistant tab
                    await expect(iframe.getByTestId('ai-chat')).toBeVisible();
                },
                // Runs inside the iframe (not the parent doc) and per viewport.
                normalizeBeforeScreenshot: (page) =>
                    page
                        .frameLocator('#gitbook-widget-iframe')
                        .locator('body')
                        .evaluate(overrideAIInitialState),
            },
            {
                name: 'API - navigateToPage',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('navigateToPage', '/text-page');
                    });
                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible({
                        timeout: 20000,
                    });
                    await expect(iframe.owner()).toHaveAttribute(
                        'src',
                        expect.stringContaining('text-page')
                    );
                },
            },
            {
                name: 'API - postUserMessage',
                url: '',
                run: async (page) => {
                    await page.evaluate((aiPrompt) => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('postUserMessage', aiPrompt);
                    }, AI_PROMPT);
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('ai-chat')).toBeVisible();
                    await expect(iframe.getByTestId('ai-chat-message-user').first()).toHaveText(
                        AI_PROMPT
                    );
                    // Wait for the full response to settle before normalizing.
                    await waitForAIChatResponse(iframe);
                },
                // Runs inside the iframe (not the parent doc) and per viewport.
                normalizeBeforeScreenshot: (page) =>
                    page
                        .frameLocator('#gitbook-widget-iframe')
                        .locator('body')
                        .evaluate(overrideAIResponse),
            },
            {
                name: 'Configuration - Suggested questions',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            suggestions: [
                                'What is GitBook?',
                                'How do I get started?',
                                'What can you do?',
                            ],
                        });
                    });
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(
                        iframe.getByTestId('ai-chat-suggested-question').nth(0)
                    ).toHaveText('What is GitBook?');
                    await expect(
                        iframe.getByTestId('ai-chat-suggested-question').nth(1)
                    ).toHaveText('How do I get started?');
                    await expect(
                        iframe.getByTestId('ai-chat-suggested-question').nth(2)
                    ).toHaveText('What can you do?');
                },
                // Runs inside the iframe (not the parent doc) and per viewport.
                normalizeBeforeScreenshot: (page) =>
                    page
                        .frameLocator('#gitbook-widget-iframe')
                        .locator('body')
                        .evaluate(overrideAIInitialState),
            },
            {
                name: 'Configuration - Custom action buttons',
                url: '',
                run: async (page) => {
                    await page.evaluate((aiPrompt) => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            actions: [
                                {
                                    label: 'Open internal link',
                                    icon: 'bolt',
                                    onClick: () => {
                                        const GitBook =
                                            window.GitBook as unknown as GitBookStandalone;
                                        GitBook('navigateToPage', '/text-page');
                                    },
                                },
                                {
                                    label: 'Open external link',
                                    icon: 'sparkle',
                                    onClick: () => {
                                        window.open('https://gitbook.com', '_blank');
                                    },
                                },
                                {
                                    label: 'Post message',
                                    icon: 'message',
                                    onClick: () => {
                                        const GitBook =
                                            window.GitBook as unknown as GitBookStandalone;
                                        GitBook('postUserMessage', aiPrompt);
                                        GitBook('navigateToAssistant');
                                    },
                                },
                                {
                                    label: 'Close',
                                    icon: 'xmark',
                                    onClick: () => {
                                        const GitBook =
                                            window.GitBook as unknown as GitBookStandalone;
                                        GitBook('close');
                                    },
                                },
                            ],
                        });
                    }, AI_PROMPT);
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('embed-action')).toHaveCount(4);
                    const actions = iframe.getByTestId('embed-action');

                    await expect(actions.nth(0)).toHaveAccessibleName('Open internal link');
                    await actions.nth(0).click();
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible();
                    await expect(iframe.owner()).toHaveAttribute(
                        'src',
                        expect.stringContaining('text-page')
                    );

                    await expect(actions.nth(1)).toHaveAccessibleName('Open external link');
                    // Intercept the new page event without navigating
                    const [newPage] = await Promise.all([
                        page.context().waitForEvent('page', { timeout: 5000 }),
                        actions.nth(1).click(),
                    ]);
                    // Verify the new page would have opened with the expected URL
                    await expect(newPage).toHaveURL(/gitbook\.com/);
                    // Close it immediately to avoid navigation
                    await newPage.close();

                    await expect(actions.nth(2)).toHaveAccessibleName('Post message');
                    await actions.nth(2).click();
                    await expect(iframe.getByTestId('ai-chat')).toBeVisible();
                    await expect(iframe.getByTestId('ai-chat-message-user').first()).toHaveText(
                        AI_PROMPT
                    );

                    await expect(actions.nth(3)).toHaveAccessibleName('Close');
                    await actions.nth(3).click();
                    await expect(page.locator('#gitbook-widget-window')).not.toBeVisible();
                    await page.locator('#gitbook-widget-button').click();
                    // Wait for the response posted above to settle before normalizing.
                    await waitForAIChatResponse(iframe);
                },
                // Runs inside the iframe (not the parent doc) and per viewport.
                normalizeBeforeScreenshot: (page) =>
                    page
                        .frameLocator('#gitbook-widget-iframe')
                        .locator('body')
                        .evaluate(overrideAIResponse),
            },
            {
                name: 'Configuration - Custom tools',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            tools: [
                                {
                                    name: 'contact_support',
                                    description: 'Contact support on behalf of the user',
                                    execute: async () => {
                                        return {
                                            output: { message: 'Support message' },
                                            summary: {
                                                text: 'Contacted support',
                                                icon: 'circle-question',
                                            },
                                        };
                                    },
                                    confirmation: {
                                        icon: 'circle-question',
                                        label: 'Contact support',
                                    },
                                },
                            ],
                        });
                        GitBook(
                            'postUserMessage',
                            'I want to contact support. Call the tool directly without a preamble. Do not respond with anything else.'
                        );
                    });
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('ai-chat-message-user').first()).toHaveText(
                        'I want to contact support. Call the tool directly without a preamble. Do not respond with anything else.'
                    );
                    const toolConfirmation = iframe
                        .getByTestId('ai-chat-tool-confirm-accept')
                        .first();
                    await expect(toolConfirmation).toBeVisible({
                        timeout: 30000,
                    });
                    // The turn settles (aria-busy clears) once the stream pauses on the
                    // confirmation control; wait for that before normalizing.
                    await waitForAIChatResponse(iframe);
                },
                // Runs inside the iframe (not the parent doc) and per viewport.
                normalizeBeforeScreenshot: (page) =>
                    page
                        .frameLocator('#gitbook-widget-iframe')
                        .locator('body')
                        .evaluate(overrideAIResponse),
            },
        ],
    },
    {
        name: 'Docs Embed - Docs Only',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/~gitbook/embed/demo/',
        skip: process.env.ARGOS_BUILD_NAME !== 'v2-vercel',
        tests: [
            {
                name: 'Docs only',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            tabs: ['docs'],
                        });
                    });
                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible({
                        timeout: 20000,
                    });
                },
            },
            {
                name: 'Table of contents',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            tabs: ['docs'],
                        });
                    });
                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible({
                        timeout: 20000,
                    });
                    const tocButton = iframe.getByTestId('toc-button');
                    await expect(tocButton).toBeVisible();
                    await tocButton.click();
                    await expect(iframe.getByTestId('table-of-contents')).toBeVisible();
                },
            },
            {
                name: 'Open in new tab',
                url: '',
                run: async (page) => {
                    await page.evaluate(() => {
                        const GitBook = window.GitBook as unknown as GitBookStandalone;
                        GitBook('configure', {
                            tabs: ['docs'],
                        });
                    });
                    await expect(page.locator('#gitbook-widget-window')).toBeVisible();
                    const iframe = page.frameLocator('#gitbook-widget-iframe');
                    await expect(iframe.getByTestId('embed-docs-page')).toBeVisible({
                        timeout: 20000,
                    });
                    const openInNewTabButton = iframe.getByTestId(
                        'embed-docs-page-open-in-new-tab'
                    );
                    await expect(openInNewTabButton).toBeVisible();
                    // Intercept the new page event without navigating
                    const [newPage] = await Promise.all([
                        page.context().waitForEvent('page', { timeout: 5000 }),
                        openInNewTabButton.click(),
                    ]);
                    // Verify the new page would have opened with the expected URL
                    await expect(newPage).toHaveURL(/gitbook\.gitbook\.io/);
                    // Close it immediately to avoid navigation
                    await newPage.close();
                },
            },
        ],
    },
    {
        name: 'Docs Embed - Search',
        contentBaseURL: 'https://gitbook.gitbook.io/test-gitbook-open/~gitbook/embed/',
        tests: [
            {
                name: 'Enter while results load opens the top result',
                url: 'search',
                screenshot: false,
                run: async (page) => {
                    await page.waitForLoadState('load');
                    const heldSearch = await holdSearchRequests(page);
                    const searchInput = page.getByTestId('search-input');
                    await searchInput.pressSequentially('files');
                    const search = await heldSearch('files');

                    await searchInput.press('Enter');
                    await page.waitForTimeout(1000);
                    await expect(searchInput).toBeFocused();
                    await expect(page.getByTestId('embed-docs-page')).toHaveCount(0);

                    const topResult = await answerSearch(search);
                    await expect(
                        page.getByRole('heading', { level: 1, name: topResult.title, exact: true })
                    ).toBeVisible({ timeout: 20000 });
                },
            },
        ],
    },
];

runTestCases(testCases);

test('Docs Embed inherits the site questions unless the host supplies questions', async ({
    page,
}) => {
    const docsURL = 'https://gitbook.com/docs/';
    const { apiToken, organization, site, siteSpace } = await getSiteAPIToken(docsURL);
    const api = new GitBookAPI({ endpoint: 'https://api.gitbook.com/cache', authToken: apiToken });
    const { data } = await api.orgs.getPublishedContentSite(organization, site, {});
    const customization = data.customizations.siteSpaces[siteSpace] ?? data.customizations.site;
    const siteQuestions = [...new Set(customization.ai?.suggestions)];
    expect(siteQuestions.length).toBeGreaterThan(0);

    const hostURL = getContentTestURL(new URL('~gitbook/embed/demo/', docsURL).href);
    const loaderURL = getContentTestURL(new URL('~gitbook/embed/script.js', docsURL).href);
    const hostQuestions = ['Where should I start?'];
    await page.route(hostURL, (route) =>
        route.fulfill({
            contentType: 'text/html',
            body: `<!doctype html>
                <button id="override">Use host questions</button>
                <script src="${loaderURL}"></script>
                <script>
                    GitBook('configure', {
                        tabs: ['assistant'],
                        assistantName: 'Docs Assistant',
                        suggestions: [],
                    });
                    GitBook('open');
                    document.getElementById('override').onclick = () => {
                        GitBook('configure', { suggestions: ${JSON.stringify(hostQuestions)} });
                    };
                </script>`,
        })
    );

    await page.goto(hostURL, { waitUntil: 'domcontentloaded' });
    const frame = page.frameLocator('#gitbook-widget-iframe');
    await expect(frame.getByText('Docs Assistant', { exact: true })).toBeVisible();
    const questions = frame.getByTestId('ai-chat-suggested-question');
    await expect(questions).toHaveText(siteQuestions);

    await page.getByRole('button', { name: 'Use host questions' }).click();
    await expect(questions).toHaveText(hostQuestions);
});
