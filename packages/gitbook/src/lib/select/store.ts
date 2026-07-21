import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';
import { SELECT_LIST_CAP, SELECT_STORAGE_KEY, selectRankAttribute } from './constants';

/**
 * The one piece of `select` state: a site-wide, recency-ordered list of active slugs
 * (most-recent-first, deduped, capped). Setters `activate`/`deactivate` slugs; consumers read the
 * list through `resolveActiveSlug`. Everything is client-side — the store is never rendered into
 * SSR HTML, so pages stay byte-identical for every visitor.
 */
export interface SelectState {
    slugs: string[];
}

let state: SelectState = { slugs: [] };
const listeners = new Set<() => void>();
let initialized = false;

/** Current selection. Server-side this is always the empty list. */
export function getState(): SelectState {
    return state;
}

/** Subscribe to selection changes. Returns an unsubscribe function. */
export function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Dedupe, drop empties, and cap to the most-recent {@link SELECT_LIST_CAP} slugs. */
function normalize(slugs: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const slug of slugs) {
        if (!slug || seen.has(slug)) {
            continue;
        }
        seen.add(slug);
        out.push(slug);
        if (out.length >= SELECT_LIST_CAP) {
            break;
        }
    }
    return out;
}

function sameList(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((slug, index) => slug === b[index]);
}

function commit(nextSlugs: string[]) {
    const slugs = normalize(nextSlugs);
    // No-op when nothing changed — this is what keeps the store⇄URL mirror from looping.
    if (sameList(slugs, state.slugs)) {
        return;
    }
    state = { slugs };
    setLocalStorageItem(SELECT_STORAGE_KEY, slugs);
    mirrorToHtml(slugs);
    for (const listener of listeners) {
        listener();
    }
}

/** Move a slug to the front (most-recent). No-op for an empty slug. */
export function activate(slug: string) {
    if (!slug) {
        return;
    }
    commit([slug, ...state.slugs]);
}

/** Remove a slug from the list (used by filters). */
export function deactivate(slug: string) {
    if (!slug) {
        return;
    }
    commit(state.slugs.filter((s) => s !== slug));
}

/** Replace the whole list (used when hydrating from URL + storage). */
export function setSlugs(slugs: string[]) {
    commit(slugs);
}

/**
 * The single shared resolution rule every consumer uses: given the slugs a block contains, return
 * the one that is most recently active (smallest index), or `null` so the caller can fall back to
 * its own default.
 */
export function resolveActiveSlug(candidates: string[]): string | null {
    let best: string | null = null;
    let bestIndex = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
        const index = state.slugs.indexOf(candidate);
        if (index >= 0 && index < bestIndex) {
            bestIndex = index;
            best = candidate;
        }
    }
    return best;
}

/**
 * Hydrate the in-memory store from localStorage (once per full page load). The pre-paint script has
 * already merged `?select=` into storage and written `<html>` before this runs, so we just adopt it;
 * we re-mirror to `<html>` too, to stay correct after a client-side navigation.
 */
export function init() {
    if (initialized) {
        return;
    }
    initialized = true;
    const stored = getLocalStorageItem<string[]>(SELECT_STORAGE_KEY, []);
    state = { slugs: normalize(Array.isArray(stored) ? stored : []) };
    mirrorToHtml(state.slugs);
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Write the recency list onto `<html>` as `data-sel-0…N` attributes — the same attributes the
 * pre-paint script writes — so runtime updates re-drive the exact CSS that handled the first paint.
 */
function mirrorToHtml(slugs: string[]) {
    if (typeof document === 'undefined') {
        return;
    }
    const el = document.documentElement;
    for (let rank = 0; rank < SELECT_LIST_CAP; rank++) {
        const attribute = selectRankAttribute(rank);
        const slug = slugs[rank];
        if (slug) {
            el.setAttribute(attribute, slug);
        } else {
            el.removeAttribute(attribute);
        }
    }
}
