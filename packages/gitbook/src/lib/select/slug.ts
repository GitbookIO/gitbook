/**
 * Version of the slugification algorithm below.
 *
 * The slugs it produces are the keys that sync content across the site, baked into server-rendered
 * markup and CSS and persisted in the visitor's localStorage. Changing the algorithm in place would
 * orphan every stored selection and desync it from the markup, so any future change must bump this
 * version and be gated behind it.
 */
export const SLUG_ALGO_VERSION = 1;

/**
 * Maximum slug length, counted in code points (not UTF-16 units, so we never cleave a surrogate
 * pair). Guards against pathological titles bloating the generated CSS and stored state. Part of the
 * contract (see {@link SLUG_ALGO_VERSION}).
 */
export const SLUG_MAX_CODE_POINTS = 64;

/**
 * Turn an author-typed name (a tab title, button label, picker option…) into a `select` slug.
 *
 * DO NOT CHANGE in place — see {@link SLUG_ALGO_VERSION}. The output must be byte-identical on the
 * server (baking slugs into markup/CSS) and the client (reading storage), so it relies only on
 * locale-independent primitives: Unicode NFKC
 * normalization + `String.prototype.toLowerCase` (Unicode default case folding, not locale-sensitive).
 *
 * It keeps letters, numbers and marks from every script (so `café`, `安装`, `日本語` survive) plus a
 * small safelist of symbols — `+ # . _` — that distinguish technical names that would otherwise
 * collide (`c` vs `c++` vs `c#`, `node.js`, `on_prem`). Every other run of characters collapses to a
 * single `-`, and leading/trailing `-` are trimmed. A slug can never contain a `,`, which callers rely
 * on to join slug lists into a single key (see `useResolvedSlug`) — but the safelist widens the set
 * beyond bare word characters, so consumers that interpolate a slug into another syntax must still
 * escape for it (see the CSS escaping in generateSelectCSS).
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
