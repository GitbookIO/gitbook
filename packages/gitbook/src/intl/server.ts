import type { SiteCustomizationSettings } from '@gitbook/api';

import { type TranslationLanguage, languages } from './translations';

export * from './translate';

/**
 * Create the translation context for a space to use in the server components.
 */
export function getSpaceLanguage(customization: SiteCustomizationSettings): TranslationLanguage {
    const fallback = languages.en;

    const { locale } = customization.internationalization;

    let language = fallback;
    // @ts-ignore
    if (locale !== 'en' && languages[locale]) {
        // @ts-ignore
        language = languages[locale];
    }

    return {
        ...fallback,
        ...language,
    };
}
