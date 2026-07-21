/**
 * localStorage key holding the visitor's selection: a JSON array of slugs, most-recent-first.
 * Not namespaced per site — a slug is just a key, so a selection ("python") is meant to follow the
 * visitor across pages and spaces, exactly like the tabs store it generalizes.
 */
export const SELECT_STORAGE_KEY = '@gitbook/select';

/**
 * Single query parameter carrying shareable selection state, e.g. `?select=python,cloud`
 * (most-recent-first). A fixed key so author-chosen names never collide with reserved params.
 */
export const SELECT_URL_PARAM = 'select';

/**
 * How many slugs are remembered. Also the depth of the CSS "rank ladder" (see generateSelectCSS):
 * a candidate ranked beyond this falls back to its default until re-activated.
 */
export const SELECT_LIST_CAP = 12;

/**
 * Attribute written on `<html>` for the slug at a given recency rank, e.g. `data-sel-0="python"`.
 * The pre-paint script and the store both write these; the generated CSS reads them.
 */
export function selectRankAttribute(rank: number): string {
    return `data-sel-${rank}`;
}

// DOM contract applied by consumer blocks (tabs, cards, …) and read by the generated CSS.

/** Marks a group of mutually-exclusive options (e.g. a tab group). */
export const SELECT_GROUP_ATTR = 'data-select-group';
/** Carries a pane's slug, e.g. `data-select-option="python"`. */
export const SELECT_OPTION_ATTR = 'data-select-option';
/** Marks the pane shown when none of the group's slugs are active. */
export const SELECT_DEFAULT_ATTR = 'data-select-default';
/** Class prefix identifying a distinct candidate-set so identical sets share one stylesheet. */
export const SELECT_SET_CLASS_PREFIX = 'sgset-';
