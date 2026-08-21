import { CustomizationDefaultThemeMode, type SiteCustomizationSettings } from '@gitbook/api';

import { getEmbeddableLinker } from './embeddable-linker';
import { getLinkerForSiteSpace } from './sites';
import { type RouteLayoutParams, getDynamicSiteContext, getStaticSiteContext } from '@/app/utils';
import type { GitBookSiteContext } from '@/lib/context';

/**
 * Get the context for the embeddable static routes.
 */
export async function getEmbeddableStaticContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getStaticSiteContext(params);
    const context: GitBookSiteContext = {
        ...baseContext,
        linker: getLinkerForSiteSpace(
            getEmbeddableLinker(baseContext.linker),
            baseContext.siteSpace,
            baseContext.revision.pages
        ),
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
        linker: getLinkerForSiteSpace(
            getEmbeddableLinker(baseContext.linker),
            baseContext.siteSpace,
            baseContext.revision.pages
        ),
    };

    return {
        context,
        visitorAuthClaims,
    };
}

export { getEmbeddableLinker } from './embeddable-linker';

/**
 * Resolve the theme the embed renders in: the site's own when it publishes a single theme, an
 * explicit `?theme=` override when it publishes both, and otherwise the visitor's OS.
 *
 * `forcedTheme` is also what the embed is pinned to whatever the embedder asks for, which is what
 * the widget outside the iframe has to follow (RND-12558).
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
