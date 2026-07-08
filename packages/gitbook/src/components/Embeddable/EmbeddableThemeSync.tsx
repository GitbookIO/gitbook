'use client';

import type { CustomizationDefaultThemeMode } from '@gitbook/api';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

/**
 * Persist a theme forced via the URL (`?theme=light`/`?theme=dark`) into the embed's own
 * theme storage, so it is remembered across tab navigation and reloads instead of only
 * applying while the query string is present (RND-11571).
 *
 * The server still forces the theme on the first load (avoiding a flash); this just writes it
 * to next-themes' storage so subsequent embed pages — which are loaded without the query —
 * pick it up from storage. An explicit theme on a later load overrides the remembered one.
 */
export function EmbeddableThemeSync({
    forcedTheme,
}: {
    forcedTheme?: CustomizationDefaultThemeMode | null;
}) {
    const { setTheme } = useTheme();

    // Ref so the effect only runs when `forcedTheme` changes: next-themes recreates `setTheme` on
    // every theme change, and depending on it would re-write storage each time — causing a cross-tab
    // ping-pong between two same-site embeds opened at different `?theme=` values.
    const setThemeRef = useRef(setTheme);
    setThemeRef.current = setTheme;

    useEffect(() => {
        if (forcedTheme) {
            setThemeRef.current(forcedTheme);
        }
    }, [forcedTheme]);

    return null;
}
