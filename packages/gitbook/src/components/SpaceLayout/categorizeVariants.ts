import { languages } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';

/**
 * Categorize the variants of the space into generic and translation variants.
 */
export function categorizeVariants(context: GitBookSiteContext) {
    const { siteSpace, visibleSiteSpaces: siteSpaces } = context;
    const currentLanguage = siteSpace.space.language;

    // Get all languages of the variants.
    const variantLanguages = [...new Set(siteSpaces.map((space) => space.space.language))];

    // We only show the language picker if there are at least 2 distinct languages, excluding undefined.
    const isMultiLanguage =
        variantLanguages.filter((language) => language !== undefined).length > 1;

    // Generic variants are all spaces that have the same language as the current (can also be undefined).
    const genericVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || space.space.language === currentLanguage
          )
        : siteSpaces;

    // Translation variants are all spaces that have a different language than the current.
    let translationVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || space.space.language !== currentLanguage
          )
        : [];

    // If there is exactly 1 variant per language, we will use them as-is.
    // Otherwise, we will create a translation dropdown with the first space of each language.
    if (variantLanguages.length !== translationVariants.length) {
        translationVariants = variantLanguages
            // Get the first space of each language.
            .map((variantLanguage) =>
                translationVariants.find((space) => space.space.language === variantLanguage)
            )
            // Filter out unmatched languages.
            .filter((space) => space !== undefined)
            // Transform the title to include the language name if we have a translation. Otherwise, use the original title.
            .map((space) => {
                const language = languages[space.space.language as keyof typeof languages];
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
