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
    const mode = customization.themes.default;
    // A site published in one concrete theme renders in it whatever the embedder asks for: its
    // content only exists for that theme. `System` pins nothing, so an override applies there —
    // and it has to, or the widget outside would follow the page while the docs follow the OS
    // (RND-12558). Unforced `System` also lets next-themes resolve prefers-color-scheme pre-paint,
    // avoiding a flash (RND-11643).
    if (!customization.themes.toggeable && mode !== CustomizationDefaultThemeMode.System) {
        return {
            htmlTheme: mode,
            defaultTheme: mode,
            forcedTheme: mode,
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
