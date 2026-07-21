/**
 * Read the `select` state (URL `?select=` + localStorage) and apply it to `<html>` as `data-sel-N`
 * attributes as early as possible, so the correct content variant is visible before hydration — no
 * flash, and it works on cached/static HTML.
 *
 * NOTE: this runs in `<head>` before `<body>` exists, and is stringified and injected — so it must be
 * self-contained (no imports/closures) and touch only `document.documentElement`. The attribute name
 * and merge rules mirror `lib/select` (`selectRankAttribute`, the store's `normalize`); keep them in
 * sync. URL slugs are prepended so a shared link wins while the visitor's other preferences survive.
 */
export function applySelectStateScript(storageKey: string, urlParam: string, cap: number) {
    try {
        const slugs: string[] = [];
        const seen: Record<string, boolean> = {};
        const push = (value: string | null | undefined) => {
            if (!value) {
                return;
            }
            const slug = String(value).trim();
            if (!slug || seen[slug] || slugs.length >= cap) {
                return;
            }
            seen[slug] = true;
            slugs.push(slug);
        };

        const fromUrl = new URLSearchParams(window.location.search).get(urlParam);
        if (fromUrl) {
            const parts = fromUrl.split(',');
            for (let i = 0; i < parts.length; i++) {
                push(parts[i]);
            }
        }

        const storedStr = window.localStorage.getItem(storageKey);
        if (storedStr) {
            const stored = JSON.parse(storedStr);
            if (stored?.length) {
                for (let j = 0; j < stored.length; j++) {
                    push(stored[j]);
                }
            }
        }

        const el = document.documentElement;
        for (let rank = 0; rank < cap; rank++) {
            const attribute = `data-sel-${rank}`;
            const slug = slugs[rank];
            if (slug) {
                el.setAttribute(attribute, slug);
            } else {
                el.removeAttribute(attribute);
            }
        }

        window.localStorage.setItem(storageKey, JSON.stringify(slugs));
    } catch {
        // localStorage blocked (private mode) or malformed state — fall through to block defaults.
    }
}
