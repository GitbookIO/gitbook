import { CustomizationSettings } from '@gitbook/api';

import { languages, TranslationLanguage } from './translations';

export * from './translate';

/**
 * Create the translation context for a space to use in the server components.
 */
export function getSpaceLanguage(customization: CustomizationSettings): TranslationLanguage {
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
