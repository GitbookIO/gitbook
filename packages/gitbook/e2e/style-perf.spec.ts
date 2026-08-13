import { type CDPSession, type Locator, type Page, expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { getContentTestURL } from '../tests/utils';
import { waitForCookiesDialog } from './util';

/** Already covered by `customers.spec.ts`, and among the largest pages we render. */
const LARGE_PAGE_URL = 'https://docs.snyk.io/snyk-api/reference/apps';

/** Table rows the preview workflow pastes into a PR comment. Relative to the package, gitignored. */
const REPORT_FILE = 'test-results/style-perf.md';

// Share of the page one popup may restyle: a ratio so it survives the page growing, a count rather
// than a duration so it does not move with CI machine speed. `search` is above 1 because it still
// restyles the whole document — a ratchet against today's state, to lower as families get fixed.
const RESTYLE_BUDGET_RATIO = {
    'openapi-select': 0.25,
    search: 1.25,
};

type TraceEvent = { name: string; args?: { elementCount?: number } };

/** Elements Blink restyled while `action` ran — DevTools reports this as "Elements affected". */
async function countRestyledElements(
    page: Page,
    client: CDPSession,
    action: () => Promise<void>
): Promise<number> {
    // Style is computed lazily, so settle queued recalcs or earlier work lands in the trace.
    await page.evaluate(() => void document.body.offsetHeight);

    await client.send('Tracing.start', {
        categories: 'disabled-by-default-devtools.timeline',
        transferMode: 'ReturnAsStream',
    });

    await action();
    await page.evaluate(() => void document.body.offsetHeight);

    const handle = await new Promise<string>((resolve) => {
        client.once('Tracing.tracingComplete', (event) => resolve(event.stream as string));
        void client.send('Tracing.end');
    });

    let raw = '';
    for (let eof = false; !eof;) {
        const chunk = await client.send('IO.read', { handle });
        raw += chunk.data;
        eof = chunk.eof;
    }
    await client.send('IO.close', { handle });

    const parsed = JSON.parse(raw);
    const events: TraceEvent[] = Array.isArray(parsed) ? parsed : parsed.traceEvents;

    return events
        .filter((event) => event.name === 'UpdateLayoutTree')
        .reduce((total, event) => total + (event.args?.elementCount ?? 0), 0);
}

/**
 * Measure a *re*open: the first open also pays for mounting the popup, and waiting on anything
 * looser than the popup being hidden again undercounts the reopen by ~10x.
 */
async function measureReopen(
    page: Page,
    client: CDPSession,
    open: () => Promise<void>,
    popup: Locator
): Promise<number> {
    await open();
    await expect(popup).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();

    const restyled = await countRestyledElements(page, client, open);
    await expect(popup, 'the measurement is meaningless if the popup did not open').toBeVisible();

    // Leave the page as we found it, so the next measurement is not measuring this popup's teardown.
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();

    return restyled;
}

type Measurement = { name: keyof typeof RESTYLE_BUDGET_RATIO; restyled: number };

function expectWithinBudgets(measurements: Measurement[], total: number) {
    const count = (value: number) => value.toLocaleString('en-US');

    // Reported before asserting, so a blown budget still reaches the PR comment.
    mkdirSync(dirname(REPORT_FILE), { recursive: true });
    writeFileSync(
        REPORT_FILE,
        measurements
            .map(({ name, restyled }) => {
                const ratio = restyled / total;
                const budget = RESTYLE_BUDGET_RATIO[name];
                const status = ratio < budget ? '✅' : '❌';
                return `| \`${name}\` | ${count(restyled)} | ${count(total)} | ${(ratio * 100).toFixed(1)}% | ${(budget * 100).toFixed(0)}% | ${status} |\n`;
            })
            .join('')
    );

    // Soft, so one breach still reports the other interaction rather than masking it.
    for (const { name, restyled } of measurements) {
        expect
            .soft(restyled / total, `${name} restyled ${restyled} of ${total} elements`)
            .toBeLessThan(RESTYLE_BUDGET_RATIO[name]);
    }
}

async function openLargePage(page: Page) {
    await page.goto(getContentTestURL(LARGE_PAGE_URL));
    await waitForCookiesDialog(page);

    // Measure a settled page: before hydration the tree is smaller and no popup can open at all.
    await page.locator('html.hydrated').waitFor();
    await expect(page.getByLabel('OpenAPI Select').first()).toBeAttached();
    await page.waitForLoadState('networkidle');

    const client = await page.context().newCDPSession(page);
    const totalElements = await page.evaluate(() => document.getElementsByTagName('*').length);

    return { client, totalElements };
}

// Guards the harness: if an idle window is busy, background work is leaking into the measurements
// and they mean nothing. Closing a popup leaves a few elements of teardown, so this is not zero —
// it only has to sit far below a real measurement (hundreds) and a whole-document restyle (~11k).
const IDLE_RESTYLE_TOLERANCE = 100;

async function expectIdle(page: Page, client: CDPSession) {
    const restyled = await countRestyledElements(page, client, async () => {});
    expect(restyled, 'an idle page should barely restyle').toBeLessThan(IDLE_RESTYLE_TOLERANCE);
}

test('opening a popup restyles a bounded part of a large API reference', async ({ page }) => {
    const { client, totalElements } = await openLargePage(page);
    await expectIdle(page, client);

    const trigger = page.getByLabel('OpenAPI Select').first();
    await trigger.scrollIntoViewIfNeeded();
    const select = await measureReopen(
        page,
        client,
        () => trigger.click(),
        page.locator('.openapi-select-popover')
    );

    await expectIdle(page, client);

    // Click rather than focus: after a close the input still holds focus, so `focus()` fires
    // nothing and would not reopen. A click is what a reader does anyway.
    const searchInput = page.getByTestId('search-input');
    const search = await measureReopen(
        page,
        client,
        () => searchInput.click(),
        page.getByTestId('search-results')
    );

    expectWithinBudgets(
        [
            { name: 'openapi-select', restyled: select },
            { name: 'search', restyled: search },
        ],
        totalElements
    );
});
