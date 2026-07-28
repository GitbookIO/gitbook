import {
    SELECT_DEFAULT_ATTR,
    SELECT_LIST_CAP,
    SELECT_OPTION_ATTR,
    SELECT_SET_CLASS_PREFIX,
    selectRankAttribute,
} from './constants';

/**
 * Stable, order-independent hash of a candidate set, so two groups offering the same options
 * (e.g. `npm`/`yarn`/`pnpm` repeated across a docs site) share one generated stylesheet.
 */
function hashSlugSet(slugs: string[]): string {
    const key = [...slugs].sort().join(' ');
    // FNV-1a: deterministic and dependency-free. Collision risk is irrelevant here since a clash
    // only means two identical-looking sets share CSS, which is exactly what we want anyway.
    let hash = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
        hash ^= key.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

/**
 * The class a consumer puts on a group element to scope the generated CSS to it. Keyed on the
 * candidate set (not its order), matching {@link generateSelectCSS}.
 */
export function selectSetClassName(candidateSlugs: string[]): string {
    return `${SELECT_SET_CLASS_PREFIX}${hashSlugSet(uniqueSlugs(candidateSlugs))}`;
}

function uniqueSlugs(slugs: string[]): string[] {
    return [...new Set(slugs.filter(Boolean))];
}

/**
 * Escape a slug for interpolation into a CSS string literal (a quoted attribute-selector value).
 * `slugifySelectValue` can't currently produce `"` or `\`, so this is defensive — it keeps the
 * generated CSS well-formed if the slug charset is ever widened.
 */
function escapeCssString(value: string): string {
    return value.replace(/["\\]/g, '\\$&');
}

/**
 * Generate the CSS that makes a group show the most-recently-activated of its options — the same
 * rule as `resolveActiveSlug`, expressed purely in CSS so it works before hydration and with
 * JavaScript disabled.
 *
 * CSS can't compare two dynamic attributes, but it can compare a dynamic `<html>` rank attribute
 * (`data-sel-i`, written by the pre-paint script/store) against the set's slugs, which the server
 * knows as literals. We encode the "most recent wins" priority in **source order** rather than in
 * selector specificity: rank rules are emitted worst-first (highest rank down to rank 0), so the
 * most-recent match appears last and wins the cascade among these equal-specificity rules. At each
 * rank one rule hides the group's panes and the next reveals whichever option sits there, so a lower
 * (more recent) rank cleanly overrides a higher one. When no option of the set is active anywhere,
 * the default pane shows.
 *
 * A single hide isn't possible: a group can have several of its own options active at once, so each
 * rank must re-hide to let the most recent win. But the output stays compact via two modern-CSS
 * levers (both within our Tailwind v4 browser baseline): the whole thing nests under the set's scope
 * class (`&`) so it isn't repeated in every selector, and the per-rank hide-all — which is
 * uncorrelated ("hide the group if *any* of its slugs is at this rank") — folds into one `:is()`
 * selector. The per-rank show can't fold that way (each entry correlates rank-value → option-value,
 * which `:is()` can't express), so it stays a comma list. Result: `2·depth + 2` rules, no `:not()`
 * chains. `depth` must cover every rank the store can produce — visibility is CSS-only, so a winner
 * beyond `depth` would fall back to its default — hence it defaults to {@link SELECT_LIST_CAP}.
 *
 * Returns `''` for an empty/degenerate set.
 */
export function generateSelectCSS(candidateSlugs: string[], depth = SELECT_LIST_CAP): string {
    const slugs = uniqueSlugs(candidateSlugs);
    if (slugs.length === 0) {
        return '';
    }

    const option = `[${SELECT_OPTION_ATTR}]`;

    // All rules nest under the scope class; `&` stands in for it (see nesting note above).
    const rules: string[] = [
        // Hide every option, then reveal the default. Both are overridden below when a slug is active.
        `${option}{display:none}`,
        `[${SELECT_DEFAULT_ATTR}]{display:block}`,
    ];

    for (let rank = depth - 1; rank >= 0; rank--) {
        const attr = selectRankAttribute(rank);
        const anyAtRank = slugs.map((slug) => `[${attr}="${escapeCssString(slug)}"]`).join(',');
        // When any of the set's options sits at this rank, hide the group's panes...
        rules.push(`html:is(${anyAtRank}) & ${option}{display:none}`);
        // ...then reveal whichever one matches (correlated, so a per-option list).
        const show = slugs
            .map((slug) => {
                const value = escapeCssString(slug);
                return `html[${attr}="${value}"] & [${SELECT_OPTION_ATTR}="${value}"]`;
            })
            .join(',');
        rules.push(`${show}{display:block}`);
    }

    return `.${selectSetClassName(slugs)}{${rules.join('')}}`;
}
