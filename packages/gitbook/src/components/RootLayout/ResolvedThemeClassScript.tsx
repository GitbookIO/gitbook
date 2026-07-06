import type { CustomizationDefaultThemeMode } from '@gitbook/api';

/**
 * Configuration describing how the client (`next-themes`) will resolve the theme
 * at hydration. The values must mirror exactly the props passed to the
 * `ThemeProvider` in the matching client contexts (see `SiteLayoutClientContexts`
 * and `EmbeddableRootLayout`), otherwise the pre-paint class would differ from the
 * one applied by `next-themes` and the flash would simply move rather than disappear.
 */
export type ResolvedThemeConfig = {
    /**
     * `next-themes` `forcedTheme`. When set, the stored value and default are ignored
     * (a `system` value is still resolved against `prefers-color-scheme`).
     */
    forcedTheme?: CustomizationDefaultThemeMode | null;
    /** `next-themes` `defaultTheme`, used when nothing is stored. */
    defaultTheme: CustomizationDefaultThemeMode;
    /** `next-themes` `storageKey` (localStorage key holding the visitor's preference). */
    storageKey: string;
};

/**
 * This function is stringified and executed inline in the browser, so it must be
 * pure, self-contained, and use syntax supported by all target browsers.
 *
 * It replicates `next-themes`' resolution order (`forcedTheme` → stored value →
 * default, then `system` → `prefers-color-scheme`) and applies the `dark` class to
 * the `<html>` element before first paint. This mirrors what `next-themes` applies
 * at hydration, so the cached/instant render already matches the final theme.
 */
function setResolvedThemeClass(
    forcedTheme: string | null,
    defaultTheme: string,
    storageKey: string
) {
    const root = document.documentElement;

    // `forcedTheme` wins over any stored/default value, matching next-themes.
    let theme = forcedTheme;
    if (!theme) {
        try {
            theme = window.localStorage.getItem(storageKey) || defaultTheme;
        } catch {
            theme = defaultTheme;
        }
    }

    let isDark: boolean;
    if (theme === 'system') {
        isDark =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDark = theme === 'dark';
    }

    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

/**
 * Inject a script to resolve the theme and apply the `dark` class to the `<html>`
 * element as early as possible (before first paint), bypassing React state to
 * prevent a light/dark flash on the cached/instant render.
 *
 * It intentionally does not run in a React effect: once mounted, `next-themes`
 * owns the class on the client, and re-running this would fight with it.
 */
export function ResolvedThemeClassScript({
    forcedTheme,
    defaultTheme,
    storageKey,
}: ResolvedThemeConfig) {
    const scriptArgs = JSON.stringify([forcedTheme ?? null, defaultTheme, storageKey]).slice(1, -1);

    return (
        <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: `(${setResolvedThemeClass.toString()})(${scriptArgs})`,
            }}
        />
    );
}
