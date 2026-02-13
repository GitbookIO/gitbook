import { languages } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';

/**
 * Categorize the variants of the space into generic and translation variants.
 */
export function categorizeVariants(context: GitBookSiteContext) {
    const { siteSpace, visibleSiteSpaces: siteSpaces } = context;
    const normalizeLanguage = (language: string | undefined) =>
        language === undefined ? languages.en.locale : language;

    const currentLanguage = normalizeLanguage(siteSpace.space.language);

    // Get all languages of the variants.
    const variantLanguages = [
        ...new Set(siteSpaces.map((space) => normalizeLanguage(space.space.language))),
    ];

    // We show the language picker when there are at least 2 distinct languages.
    // Spaces without an explicit language are treated as English, matching runtime defaults.
    const isMultiLanguage = variantLanguages.length > 1;

    const toNormalizedLanguage = (space: (typeof siteSpaces)[number]) =>
        normalizeLanguage(space.space.language);

    // Generic variants are all spaces that have the same language as the current (undefined is normalized to English).
    const genericVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || toNormalizedLanguage(space) === currentLanguage
          )
        : siteSpaces;

    // Translation variants are all spaces that have a different language than the current.
    let translationVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || toNormalizedLanguage(space) !== currentLanguage
          )
        : [];

    // If there is exactly 1 variant per language, we will use them as-is.
    // Otherwise, we will create a translation dropdown with the first space of each language.
    if (variantLanguages.length !== translationVariants.length) {
        translationVariants = variantLanguages
            // Get the first space of each language.
            .map((variantLanguage) =>
                translationVariants.find(
                    (space) => toNormalizedLanguage(space) === variantLanguage
                )
            )
            // Filter out unmatched languages.
            .filter((space) => space !== undefined)
            // Transform the title to include the language name if we have a translation. Otherwise, use the original title.
            .map((space) => {
                const language = languages[toNormalizedLanguage(space) as keyof typeof languages];
                return {
                    ...space,
                    title: language ? language.language : space.title,
                };
            });
    }

    return {
        generic: genericVariants,
        translations: translationVariants,
    };
}
