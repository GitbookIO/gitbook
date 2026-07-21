/**
 * Version of the slugification algorithm below.
 *
 * The slugs it produces are the keys that sync content across the site AND the values that appear
 * in the public `?select=` URL parameter. Once those URLs are in the wild the algorithm is frozen:
 * changing it would silently re-resolve links people have already shared. Any future change must
 * bump this version and be gated behind it, never applied in place.
 */
export const SLUG_ALGO_VERSION = 1;

/**
 * Turn an author-typed name (a tab title, button label, picker option…) into a `select` slug.
 *
 * DO NOT CHANGE — this is the frozen public `?select=` URL contract (see {@link SLUG_ALGO_VERSION}).
 * The output must be byte-identical on the server (baking slugs into markup/CSS) and the client
 * (parsing URLs/storage), so it relies only on locale-independent primitives:
 * Unicode NFKC normalization + `String.prototype.toLowerCase` (Unicode default case folding, not
 * locale-sensitive). Non `[a-z0-9]` runs collapse to a single `-`; leading/trailing `-` are trimmed.
 *
 * Names that reduce to nothing (e.g. purely non-latin or emoji titles) return `''`; callers treat an
 * empty slug as "no slug" and fall back to their default. The near-duplicate case (`JS` vs
 * `JavaScript` slugifying differently and therefore failing to sync) is an editor-lint concern, not
 * something this function tries to reconcile.
 */
export function slugifySelectValue(name: string): string {
    return name
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
