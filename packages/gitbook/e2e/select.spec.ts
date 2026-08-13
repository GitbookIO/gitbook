import { type Page, expect, test } from '@playwright/test';

// Import the specific modules (not the package barrel) so this stays free of the `@/` path alias
// that the store pulls in — Playwright's loader doesn't resolve it.
import { SELECT_LIST_CAP, selectRankAttribute } from '../src/lib/select/constants';
import { generateSelectCSS, selectSetClassName } from '../src/lib/select/generateSelectCSS';

/**
 * Behaviour tests for the `select` CSS: given a recency-ordered selection applied to `<html>`, a
 * group must show exactly the most-recently-activated of its options (its "first ranking"
 * selection), falling back to its default when none are active. These run in a real browser against
 * the actual generated CSS, so they assert observable visibility — not how the selectors are built.
 */

/** Render a single group of option panes with the generated stylesheet. First slug = default. */
async function renderGroup(page: Page, slugs: string[]) {
    const css = generateSelectCSS(slugs);
    const scope = selectSetClassName(slugs);
    const panes = slugs
        .map(
            (slug, index) =>
                `<div data-testid="pane-${slug}" data-select-option="${slug}"${index === 0 ? ' data-select-default' : ''}>${slug}</div>`
        )
        .join('');

    await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body><div class="${scope}" data-select-group>${panes}</div></body></html>`
    );
}

/**
 * Apply the recency list to `<html>` as `data-sel-*` attributes (most-recent first), via the shared
 * attribute-name helper — mirroring what the pre-paint script / store do at runtime.
 */
async function applySelection(page: Page, active: string[]) {
    for (const [rank, value] of active.entries()) {
        await page.evaluate(
            ({ attr, value }) => document.documentElement.setAttribute(attr, value),
            { attr: selectRankAttribute(rank), value }
        );
    }
}

/** Assert exactly one pane is visible, and it is the expected slug. */
async function expectOnlyVisible(page: Page, slugs: string[], expectedSlug: string) {
    for (const slug of slugs) {
        const pane = page.getByTestId(`pane-${slug}`);
        if (slug === expectedSlug) {
            await expect(pane).toBeVisible();
        } else {
            await expect(pane).toBeHidden();
        }
    }
}

async function setup(page: Page, slugs: string[], active: string[]) {
    await renderGroup(page, slugs);
    await applySelection(page, active);
}

test.describe('select CSS visibility', () => {
    const slugs = ['python', 'go', 'java'];

    test('shows the default when nothing is selected', async ({ page }) => {
        await setup(page, slugs, []);
        await expectOnlyVisible(page, slugs, 'python'); // first pane is the default
    });

    test('shows the selected option and hides the rest', async ({ page }) => {
        await setup(page, slugs, ['go']);
        await expectOnlyVisible(page, slugs, 'go');
    });

    test('shows the most-recently-activated option of the group', async ({ page }) => {
        // Recency list is most-recent-first: `go` is more recent than `python`.
        await setup(page, slugs, ['go', 'python']);
        await expectOnlyVisible(page, slugs, 'go');

        await setup(page, slugs, ['python', 'go']);
        await expectOnlyVisible(page, slugs, 'python');
    });

    test('ignores more-recent selections that are not in the group', async ({ page }) => {
        // `dark` is more recent but not one of this group's options, so `go` still wins.
        await setup(page, slugs, ['dark', 'go', 'python']);
        await expectOnlyVisible(page, slugs, 'go');
    });

    test('falls back to the default when no active slug is in the group', async ({ page }) => {
        await setup(page, slugs, ['dark', 'light']);
        await expectOnlyVisible(page, slugs, 'python');
    });

    test('keeps symbol-bearing slugs (c / c++ / c#) distinct through the CSS selectors', async ({
        page,
    }) => {
        // Slugs can contain `+` and `#` (see slugifySelectValue); they must survive quoted attribute
        // selectors without collapsing together.
        const symbols = ['c', 'c++', 'c#'];
        await setup(page, symbols, ['c++']);
        await expectOnlyVisible(page, symbols, 'c++');
    });

    test('shows only the first pane when a group repeats a slug (duplicate tab names)', async ({
        page,
    }) => {
        // Two panes share the slug `js`; activating it must reveal only the first, never both.
        const scope = selectSetClassName(['js', 'ts']);
        await page.setContent(
            `<!doctype html><html><head><style>${generateSelectCSS(['js', 'ts'])}</style></head><body><div class="${scope}" data-select-group><div data-testid="js-first" data-select-option="js" data-select-default>js 1</div><div data-testid="js-second" data-select-option="js">js 2</div><div data-testid="ts" data-select-option="ts">ts</div></div></body></html>`
        );
        await applySelection(page, ['js']);
        await expect(page.getByTestId('js-first')).toBeVisible();
        await expect(page.getByTestId('js-second')).toBeHidden();
        await expect(page.getByTestId('ts')).toBeHidden();
    });

    test('a pinned pane overrides first-match (the duplicate the visitor clicked)', async ({
        page,
    }) => {
        // The client marks the clicked pane data-select-pinned and its same-slug sibling unpinned;
        // the pinned one must win over the first-match default.
        const scope = selectSetClassName(['js', 'ts']);
        await page.setContent(
            `<!doctype html><html><head><style>${generateSelectCSS(['js', 'ts'])}</style></head><body><div class="${scope}" data-select-group><div data-testid="js-first" data-select-option="js" data-select-default data-select-unpinned>js 1</div><div data-testid="js-second" data-select-option="js" data-select-pinned>js 2</div></div></body></html>`
        );
        await applySelection(page, ['js']);
        await expect(page.getByTestId('js-second')).toBeVisible();
        await expect(page.getByTestId('js-first')).toBeHidden();
    });
});

interface GroupSpec {
    id: string;
    slugs: string[];
}

/**
 * Render several tab groups, each with clickable tab buttons wired to `__select` — an in-page
 * stand-in for the store's `activate()`/`mirrorToHtml()` (whose recency/dedupe/cap logic is unit
 * tested in store.test.ts). It prepends the clicked slug onto the `data-sel-*` recency list on
 * `<html>`, most-recent first. This keeps the test focused on the observable behaviour a visitor
 * sees — a real click switching every group that offers that option — driven by real browser CSS.
 */
async function renderGroups(page: Page, groups: GroupSpec[]) {
    const styles = [
        ...new Map(
            groups.map((group) => [selectSetClassName(group.slugs), generateSelectCSS(group.slugs)])
        ).values(),
    ]
        .map((css) => `<style>${css}</style>`)
        .join('');

    const markup = groups
        .map((group) => {
            const scope = selectSetClassName(group.slugs);
            const buttons = group.slugs
                .map(
                    (slug) =>
                        `<button data-testid="${group.id}-btn-${slug}" onclick="__select('${slug}')">${slug}</button>`
                )
                .join('');
            const panes = group.slugs
                .map(
                    (slug, index) =>
                        `<div data-testid="${group.id}-pane-${slug}" data-select-option="${slug}"${index === 0 ? ' data-select-default' : ''}>${slug}</div>`
                )
                .join('');
            return `<div class="${scope}" data-select-group><div role="tablist">${buttons}</div>${panes}</div>`;
        })
        .join('');

    const selectScript = `window.__select=function(slug){var el=document.documentElement,cur=[],i,v;for(i=0;i<${SELECT_LIST_CAP};i++){v=el.getAttribute('data-sel-'+i);if(v)cur.push(v);}var next=[slug];for(i=0;i<cur.length;i++){if(cur[i]!==slug)next.push(cur[i]);}next=next.slice(0,${SELECT_LIST_CAP});for(i=0;i<${SELECT_LIST_CAP};i++){if(next[i])el.setAttribute('data-sel-'+i,next[i]);else el.removeAttribute('data-sel-'+i);}};`;

    await page.setContent(
        `<!doctype html><html><head>${styles}<script>${selectScript}</script></head><body>${markup}</body></html>`
    );
}

/** Assert a specific group shows exactly `expectedSlug` and hides its other options. */
async function expectGroupShows(
    page: Page,
    groupId: string,
    slugs: string[],
    expectedSlug: string
) {
    for (const slug of slugs) {
        const pane = page.getByTestId(`${groupId}-pane-${slug}`);
        if (slug === expectedSlug) {
            await expect(pane).toBeVisible();
        } else {
            await expect(pane).toBeHidden();
        }
    }
}

test.describe('select syncing across groups (click-driven)', () => {
    test('clicking a tab syncs every group offering that option', async ({ page }) => {
        const slugs = ['python', 'go'];
        await renderGroups(page, [
            { id: 'a', slugs },
            { id: 'b', slugs },
        ]);

        // Both groups start on their default (first) pane.
        await expectGroupShows(page, 'a', slugs, 'python');
        await expectGroupShows(page, 'b', slugs, 'python');

        // Clicking a tab in group A switches group B too.
        await page.getByTestId('a-btn-go').click();
        await expectGroupShows(page, 'a', slugs, 'go');
        await expectGroupShows(page, 'b', slugs, 'go');

        // And the sync works from either group.
        await page.getByTestId('b-btn-python').click();
        await expectGroupShows(page, 'a', slugs, 'python');
        await expectGroupShows(page, 'b', slugs, 'python');
    });

    test('only groups that share the clicked option follow along', async ({ page }) => {
        const shared = ['python', 'go'];
        const other = ['go', 'rust'];
        await renderGroups(page, [
            { id: 'a', slugs: shared },
            { id: 'b', slugs: other },
        ]);

        // `rust` exists only in group B, so clicking it leaves group A on its default.
        await page.getByTestId('b-btn-rust').click();
        await expectGroupShows(page, 'b', other, 'rust');
        await expectGroupShows(page, 'a', shared, 'python');

        // `go` is shared, so clicking it in A moves both groups.
        await page.getByTestId('a-btn-go').click();
        await expectGroupShows(page, 'a', shared, 'go');
        await expectGroupShows(page, 'b', other, 'go');
    });
});
