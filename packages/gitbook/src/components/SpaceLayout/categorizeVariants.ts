import { languages } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';
import { getSiteSpaceLanguages, normalizeLanguage } from '@/lib/sites';

/**
 * Categorize the variants of the space into generic and translation variants.
 */
export function categorizeVariants(context: GitBookSiteContext) {
    const { siteSpace, visibleSiteSpaces: siteSpaces } = context;

    const currentLanguage = normalizeLanguage(context.locale);

    // Get all languages of the variants.
    const variantLanguages = getSiteSpaceLanguages(siteSpaces);

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

    const findPreferredTranslationVariant = (variantLanguage: string) => {
        const candidateSiteSpaces = translationVariants.filter(
            (space) => toNormalizedLanguage(space) === variantLanguage
        );

        return (
            candidateSiteSpaces.find((candidate) => candidate.title === siteSpace.title) ??
            candidateSiteSpaces[0]
        );
    };

    // If there is exactly 1 variant per language, we will use them as-is.
    // Otherwise, we will create a translation dropdown with the space that best matches the
    // current space title for each language, falling back to the first one.
    if (variantLanguages.length !== translationVariants.length) {
        translationVariants = variantLanguages
            .map((variantLanguage) => findPreferredTranslationVariant(variantLanguage))
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
