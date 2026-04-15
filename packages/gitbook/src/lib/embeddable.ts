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
        return {
            htmlTheme: customization.themes.default,
            defaultTheme: customization.themes.default,
            forcedTheme: customization.themes.default,
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
