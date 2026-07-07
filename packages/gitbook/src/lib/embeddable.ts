import { type RouteLayoutParams, getDynamicSiteContext, getStaticSiteContext } from '@/app/utils';
import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationDefaultThemeMode, type SiteCustomizationSettings } from '@gitbook/api';
import { getEmbeddableLinker } from './embeddable-linker';

/**
 * Get the context for the embeddable static routes.
 */
export async function getEmbeddableStaticContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getStaticSiteContext(params);
    const context: GitBookSiteContext = {
        ...baseContext,
        linker: getEmbeddableLinker(baseContext.linker),
    };

    return {
        context,
        visitorAuthClaims,
    };
}

/**
 * Get the context for the embeddable dynamic routes.
 */
export async function getEmbeddableDynamicContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getDynamicSiteContext(params);
    const context: GitBookSiteContext = {
        ...baseContext,
        linker: getEmbeddableLinker(baseContext.linker),
    };

    return {
        context,
        visitorAuthClaims,
    };
}

export { getEmbeddableLinker } from './embeddable-linker';

/**
 * Resolve theme behavior for docs embeds.
 * Embeds should follow the parent frame's color-scheme by default,
 * while still allowing an explicit override for multi-theme sites.
 */
export function resolveEmbeddableTheme(
    customization: Pick<SiteCustomizationSettings, 'themes'>,
    forcedTheme?: CustomizationDefaultThemeMode | null
) {
    if (!customization.themes.toggeable) {
        const mode = customization.themes.default;
        return {
            htmlTheme: mode,
            defaultTheme: mode,
            // Only force concrete light/dark; System stays unforced so next-themes resolves prefers-color-scheme pre-paint (avoids the flash). A theme saved while the toggle was previously on still wins — see the PR's "Known limitation". RND-11643
            forcedTheme: mode === CustomizationDefaultThemeMode.System ? undefined : mode,
        };
    }

    if (forcedTheme) {
        return {
            htmlTheme: forcedTheme,
            defaultTheme: forcedTheme,
            forcedTheme,
        };
    }

    return {
        htmlTheme: CustomizationDefaultThemeMode.System,
        defaultTheme: CustomizationDefaultThemeMode.System,
        forcedTheme: undefined,
    };
}
