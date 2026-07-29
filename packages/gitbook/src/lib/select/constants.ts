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
 * How many slugs are remembered, most-recent-first. This is also the depth of the CSS "rank ladder"
 * (see generateSelectCSS): since pane visibility is CSS-only, the ladder must cover every stored
 * rank, so the two are one knob. The generated CSS is linear in this value, so it's cheap to tune;
 * 8 comfortably covers realistic stacking of distinct preferences.
 */
export const SELECT_LIST_CAP = 8;

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
/**
 * Set by the client on an explicitly-clicked pane to pin it (with `data-select-unpinned` on its
 * same-slug siblings), overriding the first-match default so the visitor sees exactly the duplicate
 * they picked. Only applied after a real click — the pre-paint/reload path stays purely CSS-driven.
 */
export const SELECT_PINNED_ATTR = 'data-select-pinned';
export const SELECT_UNPINNED_ATTR = 'data-select-unpinned';
/**
 * Class prefix (followed by a set hash) identifying a distinct candidate-set so identical sets share
 * one stylesheet. Uses the `gb-` namespace like GitBook's other own classes (`gb-page-cover`, …) to
 * avoid colliding with author or Tailwind classes; `sel` matches the `data-sel-*` rank attributes.
 */
export const SELECT_SET_CLASS_PREFIX = 'gb-sel-';
