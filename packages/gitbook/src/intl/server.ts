import type { GitBookAnyContext } from '@/lib/context';
import {
    type TranslationLanguage,
    type TranslationLocale,
    defaultLanguage,
    isAvailableLanguage,
    loadLanguage,
} from './translations';

export * from './translate';

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
export async function getSpaceLanguage(context: GitBookAnyContext): Promise<TranslationLanguage> {
    const locale = getSpaceLocale(context);
    const language = locale === DEFAULT_LOCALE ? defaultLanguage : await loadLanguage(locale);

    return {
        ...defaultLanguage,
        ...(language ?? defaultLanguage),
    };
}

function checkIsValidLocale(locale: string): locale is TranslationLocale {
    return isAvailableLanguage(locale);
}
