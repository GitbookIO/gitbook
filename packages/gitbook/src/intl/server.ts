import type { GitBookAnyContext } from '@/lib/context';
import { type TranslationLanguage, languages } from './translations';

export * from './translate';

type TranslationLocale = keyof typeof languages;

export const DEFAULT_LOCALE = 'en' satisfies TranslationLocale;

/**
 * Get the locale to use for the HTML lang attribute.
 * This returns the actual content language even if we don't have UI translations for it.
 */
export function getContentLocale(context: GitBookAnyContext): string {
    if (context.locale) {
        return context.locale;
    }

    const customization = 'site' in context ? context.customization : null;
    if (customization) {
        return customization.internationalization.locale;
    }

    return DEFAULT_LOCALE;
}

/**
 * Get the locale to use for a space.
 */
export function getSpaceLocale(context: GitBookAnyContext): TranslationLocale {
    const customization = 'site' in context ? context.customization : null;

    // If the language is configured in the space, use it in priority
    if (context.locale) {
        if (checkIsValidLocale(context.locale)) {
            return context.locale;
        }
        return DEFAULT_LOCALE;
    }

    // Otherwise fallback to the deprecated customization settings
    if (customization) {
        return checkIsValidLocale(customization.internationalization.locale)
            ? customization.internationalization.locale
            : DEFAULT_LOCALE;
    }

    return DEFAULT_LOCALE;
}

/**
 * Create the translation context for a space to use in the server components.
 */
export function getSpaceLanguage(context: GitBookAnyContext): TranslationLanguage {
    const fallback = languages[DEFAULT_LOCALE];

    const locale = getSpaceLocale(context);

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

function checkIsValidLocale(locale: string): locale is TranslationLocale {
    return locale in languages;
}
