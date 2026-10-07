import { type Page, expect, test } from '@playwright/test';

// Import the specific module (not the package barrel) so this stays free of the `@/` path alias,
// which Playwright's loader doesn't resolve — same reason as `select.spec.ts`.
import { resolveOverflowingItems } from '../src/components/hooks/listOverflow';

/**
 * Behaviour tests for the tab bar's overflow rule (`useListOverflow`), which decides which tabs move
 * into the "more" dropdown. Rects are measured in a real browser so the geometry is genuine — the
 * layout below mirrors the tab bar in `DynamicTabs`: a non-wrapping flex row of `shrink-0` items,
 * clipped by `overflow: hidden`, measured with the dropdown rendered ahead of the tabs.
 *
 * The regression these guard is a dropdown appearing when nothing actually overflowed: measuring
 * with the dropdown present consumes `MENU` pixels, so a bar whose tabs total just under the
 * container would hand its last tab to a menu it never needed.
 */

/** Width of the ellipsis button, matching the `px-3.5` + `size-4` icon of the real one. */
const MENU = 44;

interface Row {
    /** Container width in px. */
    container: number;
    /** Tab widths in px, in order. */
    tabs: number[];
    /** Whether the dropdown is reserving space ahead of the tabs, as during a measure pass. */
    withMenu?: boolean;
    /** Hide an ancestor, so the row measures with no box at all. */
    hidden?: boolean;
}

/**
 * Lay the row out in the browser and run the real rule over the rects it produces.
 * Returns the ids reported as overflowing, or `null` when the measurement carried no information.
 */
async function measure(page: Page, row: Row): Promise<string[] | null> {
    const { container, tabs, withMenu = true, hidden = false } = row;

    const items = tabs
        .map((w, i) => `<div class="item" id="tab-${i}" style="width:${w}px">${i}</div>`)
        .join('');
    const menu = withMenu ? `<div class="item" style="width:${MENU}px">…</div>` : '';

    await page.setContent(
        `<!doctype html><html><head><style>
            * { box-sizing: border-box; }
            body { margin: 0; }
            .pane { ${hidden ? 'display: none;' : ''} }
            .bar {
                width: ${container}px;
                display: inline-flex;
                overflow: hidden;
            }
            .bar::after { content: ""; flex: 1; }
            .item { flex-shrink: 0; max-width: 100%; }
        </style></head><body>
            <div class="pane"><div class="bar" id="bar">${menu}${items}</div></div>
        </body></html>`
    );

    const measured = await page.evaluate(() => {
        const bar = document.getElementById('bar');
        if (!bar) {
            throw new Error('missing bar');
        }
        const rect = bar.getBoundingClientRect();
        return {
            container: { left: rect.left, right: rect.right, width: rect.width },
            items: [...bar.querySelectorAll<HTMLElement>('.item[id]')].map((el) => {
                const r = el.getBoundingClientRect();
                return { id: el.id, rect: { left: r.left, right: r.right } };
            }),
        };
    });

    const result = resolveOverflowingItems(measured.container, measured.items);
    return result ? [...result].sort() : null;
}

test.describe('tab overflow rule', () => {
    test('reports nothing when every tab fits with room to spare', async ({ page }) => {
        // 3 x 100 = 300 of 600, so even with the menu reserved there is slack.
        expect(await measure(page, { container: 600, tabs: [100, 100, 100] })).toEqual([]);
    });

    test('reports nothing when the tabs fit exactly', async ({ page }) => {
        expect(await measure(page, { container: 300, tabs: [100, 100, 100] })).toEqual([]);
    });

    test('reports nothing when only the reserved menu made the row overflow', async ({ page }) => {
        // The regression: tabs total 300 and the container is 320, so they fit — but measuring
        // reserves 44 for the menu, which used to push the last tab out and show a needless
        // dropdown. Every width in `container - MENU < 300 <= container` must stay empty.
        for (const container of [300, 305, 320, 330, 343]) {
            expect(
                await measure(page, { container, tabs: [100, 100, 100] }),
                `container ${container}px`
            ).toEqual([]);
        }
    });

    test('reports the tabs that genuinely do not fit alongside the menu', async ({ page }) => {
        // 300 of tabs into 290: the row really does overflow, so the menu is warranted and the
        // remaining tabs must fit beside it (100 + 100 + 44 = 244 <= 290).
        expect(await measure(page, { container: 290, tabs: [100, 100, 100] })).toEqual(['tab-2']);
    });

    test('gives up as many tabs as the width demands', async ({ page }) => {
        expect(await measure(page, { container: 190, tabs: [100, 100, 100] })).toEqual([
            'tab-1',
            'tab-2',
        ]);
        expect(await measure(page, { container: 150, tabs: [100, 100, 100] })).toEqual([
            'tab-1',
            'tab-2',
        ]);
    });

    test('moves every tab into the menu once not even the first fits beside it', async ({
        page,
    }) => {
        // 100 + 44 > 120, so no tab can share the row with the menu. Everything goes in, leaving a
        // bar that is only the menu — deliberately, since the menu is then the sole route to any
        // tab. Forcing the first tab to stay would push the menu past the clipped edge and strand
        // the rest.
        expect(await measure(page, { container: 120, tabs: [100, 100, 100] })).toEqual([
            'tab-0',
            'tab-1',
            'tab-2',
        ]);
    });

    test('keeps a single tab that fills the bar rather than hiding it behind a menu', async ({
        page,
    }) => {
        // `max-width: 100%` truncates it to the container, so it fits — a lone tab should never be
        // the only thing in the dropdown.
        expect(await measure(page, { container: 200, tabs: [400] })).toEqual([]);
    });

    test('cuts a nested bar earlier, since its pane padding narrows it', async ({ page }) => {
        // A nested tab bar sits inside a `p-4` pane, so it has 32px less to work with. At 330 the
        // outer bar keeps all three tabs; the nested one at 330 - 32 cannot.
        expect(await measure(page, { container: 330, tabs: [100, 100, 100] })).toEqual([]);
        expect(await measure(page, { container: 330 - 32, tabs: [100, 100, 100] })).toEqual([
            'tab-2',
        ]);
    });

    test('progressively fills the menu as a long list is squeezed', async ({ page }) => {
        const tabs = Array.from({ length: 12 }, () => 100);
        let previous = -1;
        for (const container of [1300, 1200, 1000, 800, 600, 400, 200]) {
            const overflowing = await measure(page, { container, tabs });
            expect(overflowing, `container ${container}px`).not.toBeNull();
            const hidden = overflowing?.length ?? 0;
            // Never loses a tab, and never un-hides one as the space shrinks.
            expect(hidden, `container ${container}px`).toBeGreaterThanOrEqual(previous);
            expect(hidden, `container ${container}px`).toBeLessThanOrEqual(tabs.length);
            previous = hidden;
        }
        // Widest fits everything; at 200 only the first tab still fits beside the menu.
        expect(await measure(page, { container: 1300, tabs })).toEqual([]);
        expect((await measure(page, { container: 200, tabs }))?.length).toBe(11);
    });

    test('reports nothing measurable while an ancestor is hidden', async ({ page }) => {
        // A bar behind an inactive tab has no box, so every rect is zero. That says nothing about
        // what fits, and must not be mistaken for "everything overflows".
        expect(
            await measure(page, { container: 200, tabs: [100, 100, 100], hidden: true })
        ).toBeNull();
    });

    test('reports nothing measurable for an empty list', async ({ page }) => {
        expect(await measure(page, { container: 600, tabs: [] })).toBeNull();
    });
});
