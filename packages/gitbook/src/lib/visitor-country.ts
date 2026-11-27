import type { PublishedContentSite, SiteCustomizationSettings } from '@gitbook/api';

/** Cookie storing the country the visitor chose over their detected one. */
export const VISITOR_COUNTRY_COOKIE = 'gitbook-visitor-country';
export const VISITOR_COUNTRY_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/** URL param choosing the visitor's country, outside `visitor.*` which carries unsigned claims. */
export const VISITOR_COUNTRY_PARAM = 'gitbook.country';

/** Middleware route returning the visitor's detected and chosen countries. */
export const VISITOR_COUNTRY_PATH = '~gitbook/visitor/country';

// TEMPORARY (RND-13578): drop once `@gitbook/api` ships `PublishedContentSite.regions` and
// `SiteCustomizationSettings.countryPicker`, then alias `SiteRegions` to `PublishedContentSite['regions']`.
/** The regions a site declares in its adaptive schema, in declaration order. */
export type SiteRegions = {
    [regionName: string]: { label?: string; countries: string[] };
};
type PublishedContentSiteWithRegions = PublishedContentSite & {
    customizations: { site: SiteCustomizationSettings & { countryPicker?: { enabled: boolean } } };
    regions?: SiteRegions;
};

/**
 * The regions to group the country picker by, or null when the site doesn't show the picker.
 * It shows only when enabled and when the site declares at least one region.
 */
export function getCountryPickerRegions(
    publishedSite: PublishedContentSiteWithRegions
): SiteRegions | null {
    const { customizations, regions } = publishedSite;
    if (customizations.site.countryPicker?.enabled !== true || !regions) {
        return null;
    }
    return Object.keys(regions).length > 0 ? regions : null;
}
