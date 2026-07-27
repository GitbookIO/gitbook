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
 * Generate the CSS that makes a group show the most-recently-activated of its options — the same
 * rule as `resolveActiveSlug`, expressed purely in CSS so it works before hydration and with
 * JavaScript disabled.
 *
 * CSS can't compare two dynamic attributes, but it can compare a dynamic `<html>` rank attribute
 * (`data-sel-i`, written by the pre-paint script/store) against the set's slugs, which the server
 * knows as literals. We encode the "most recent wins" priority in **source order** rather than in
 * selector specificity: rank rules are emitted worst-first (highest rank down to rank 0), so the
 * most-recent match appears last and wins the cascade among these equal-specificity rules. Each
 * active slug first hides the group's panes and then reveals its own, so a lower (more recent) rank
 * cleanly overrides a higher one. When no option of the set is active, the default pane shows.
 *
 * This keeps the output linear in `depth × options` with no `:not()` chains (an earlier version
 * spelled out "nobody ahead of me" with nested negations, which was quadratic in both). `depth`
 * must cover every rank the store can produce — visibility is CSS-only, so a winner beyond `depth`
 * would fall back to its default — hence it defaults to (and should track) {@link SELECT_LIST_CAP}.
 *
 * Returns `''` for an empty/degenerate set.
 */
export function generateSelectCSS(candidateSlugs: string[], depth = SELECT_LIST_CAP): string {
    const slugs = uniqueSlugs(candidateSlugs);
    if (slugs.length === 0) {
        return '';
    }

    const scope = `.${selectSetClassName(slugs)}`;

    const rules: string[] = [
        // Hide every option, then reveal the default. Both are overridden below when a slug is active.
        `${scope} [${SELECT_OPTION_ATTR}]{display:none}`,
        `${scope} [${SELECT_DEFAULT_ATTR}]{display:block}`,
    ];

    for (let rank = depth - 1; rank >= 0; rank--) {
        const attr = selectRankAttribute(rank);
        for (const slug of slugs) {
            // When this slug is active at this rank: hide the group's panes, then show this one.
            rules.push(`html[${attr}="${slug}"] ${scope} [${SELECT_OPTION_ATTR}]{display:none}`);
            rules.push(
                `html[${attr}="${slug}"] ${scope} [${SELECT_OPTION_ATTR}="${slug}"]{display:block}`
            );
        }
    }

    return rules.join('');
}
