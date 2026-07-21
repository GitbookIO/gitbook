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
 * Generate the CSS that makes a group show the most-recently-activated of its options: the same
 * rule as `resolveActiveSlug`, expressed purely in CSS so it works before hydration and with
 * JavaScript disabled.
 *
 * CSS can't compare two dynamic attributes, but it can compare a dynamic `<html>` rank attribute
 * (`data-sel-i`, written by the pre-paint script/store) against the set's slugs, which the server
 * knows as literals. So for each option we emit "wins at rank i" rules: option `c` shows iff
 * `data-sel-i="c"` and no option appears at any earlier rank. A default rule shows the
 * `data-select-default` pane when the group contributes nothing to the recency list.
 *
 * Returns `''` for an empty/degenerate set.
 */
export function generateSelectCSS(candidateSlugs: string[]): string {
    const slugs = uniqueSlugs(candidateSlugs);
    if (slugs.length === 0) {
        return '';
    }

    const scope = `.${selectSetClassName(slugs)}`;
    const rank = (i: number) => selectRankAttribute(i);
    // `:not()` clauses ruling out every option at ranks 0..upTo-1.
    const noOptionBefore = (upTo: number) => {
        let clauses = '';
        for (let j = 0; j < upTo; j++) {
            for (const slug of slugs) {
                clauses += `:not([${rank(j)}="${slug}"])`;
            }
        }
        return clauses;
    };

    const rules: string[] = [
        // Hide every option by default; the rules below reveal exactly one.
        `${scope} [${SELECT_OPTION_ATTR}]{display:none}`,
        // Show the default pane when no option of this set appears anywhere in the recency list.
        `html${noOptionBefore(SELECT_LIST_CAP)} ${scope} [${SELECT_DEFAULT_ATTR}]{display:block}`,
    ];

    for (const winner of slugs) {
        for (let i = 0; i < SELECT_LIST_CAP; i++) {
            rules.push(
                `html${noOptionBefore(i)}[${rank(i)}="${winner}"] ${scope} [${SELECT_OPTION_ATTR}="${winner}"]{display:block}`
            );
        }
    }

    return rules.join('');
}
