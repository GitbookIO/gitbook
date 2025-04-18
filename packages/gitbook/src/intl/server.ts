import type { SiteCustomizationSettings } from '@gitbook/api';

import { type TranslationLanguage, languages } from './translations';

export * from './translate';

export const DEFAULT_LOCALE = 'en';

/**
 * Get the locale of the customization.
 */
export function getCustomizationLocale(customization: SiteCustomizationSettings): string {
    return customization.internationalization.locale;
}

/**
 * Create the translation context for a space to use in the server components.
 */
export function getSpaceLanguage(customization: SiteCustomizationSettings): TranslationLanguage {
    const fallback = languages[DEFAULT_LOCALE];

    const locale = getCustomizationLocale(customization);

    let language = fallback;
    // @ts-ignore
    if (locale !== DEFAULT_LOCALE && languages[locale]) {
        // @ts-ignore
        language = languages[locale];
    }

    return {
        ...fallback,
        ...language,
    };
}
