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
 * Maximum slug length, counted in code points (not UTF-16 units, so we never cleave a surrogate
 * pair). Guards against pathological titles — 30 CJK characters is already ~270 bytes once
 * percent-encoded into `?select=`. Part of the frozen contract (see {@link SLUG_ALGO_VERSION}).
 */
export const SLUG_MAX_CODE_POINTS = 64;

/**
 * Turn an author-typed name (a tab title, button label, picker option…) into a `select` slug.
 *
 * DO NOT CHANGE — this is the frozen public `?select=` URL contract (see {@link SLUG_ALGO_VERSION}).
 * The output must be byte-identical on the server (baking slugs into markup/CSS) and the client
 * (parsing URLs/storage), so it relies only on locale-independent primitives: Unicode NFKC
 * normalization + `String.prototype.toLowerCase` (Unicode default case folding, not locale-sensitive).
 *
 * It keeps letters, numbers and marks from every script (so `café`, `安装`, `日本語` survive) plus a
 * small safelist of symbols — `+ # . _` — that distinguish technical names that would otherwise
 * collide (`c` vs `c++` vs `c#`, `node.js`, `on_prem`). Every other run of characters collapses to a
 * single `-`, and leading/trailing `-` are trimmed. A slug can never contain the `,` that delimits
 * `?select=`, and none of these characters need escaping in a URL-encoded query param — but the
 * safelist widens the set beyond bare word characters, so consumers that interpolate a slug into
 * another syntax must still escape for it (see the CSS escaping in generateSelectCSS).
 *
 * Control, format, bidi and lone-surrogate characters (`\p{C}`) are dropped outright rather than
 * turned into a `-`, and the string is re-normalized after `toLowerCase` (case mapping can leave it
 * un-normalized), so the same visible name always yields the same bytes on server and client. The
 * result is capped to {@link SLUG_MAX_CODE_POINTS} code points. Names that reduce to nothing (e.g. an
 * emoji-only title) return `''`; callers treat an empty slug as "no slug" and fall back to default.
 */
export function slugifySelectValue(name: string): string {
    const slug = name
        .normalize('NFKC')
        .replace(/\p{C}+/gu, '')
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N}\p{M}+#._]+/gu, '-')
        .replace(/^-+|-+$/gu, '');
    // Slice by code point so a surrogate pair (e.g. astral CJK) is never cut in half, then re-trim a
    // trailing `-` the cut may have exposed.
    return [...slug].slice(0, SLUG_MAX_CODE_POINTS).join('').replace(/-+$/u, '');
}
