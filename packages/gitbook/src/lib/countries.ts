/**
 * ISO 3166-1 alpha-2 codes of every officially assigned country.
 */
export const COUNTRY_CODES: readonly string[] = [
    'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ',
    'BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ',
    'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ',
    'DE DJ DK DM DO DZ',
    'EC EE EG EH ER ES ET',
    'FI FJ FK FM FO FR',
    'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY',
    'HK HM HN HR HT HU',
    'ID IE IL IM IN IO IQ IR IS IT',
    'JE JM JO JP',
    'KE KG KH KI KM KN KP KR KW KY KZ',
    'LA LB LC LI LK LR LS LT LU LV LY',
    'MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ',
    'NA NC NE NF NG NI NL NO NP NR NU NZ',
    'OM',
    'PA PE PF PG PH PK PL PM PN PR PS PT PW PY',
    'QA',
    'RE RO RS RU RW',
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ',
    'TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ',
    'UA UG UM US UY UZ',
    'VA VC VE VG VI VN VU',
    'WF WS',
    'YE YT',
    'ZA ZM ZW',
]
    .join(' ')
    .split(' ');

const COUNTRY_CODE_SET = new Set(COUNTRY_CODES);

/**
 * Upper-case a two-letter country code, or return undefined when it isn't one.
 */
export function normalizeCountryCode(value: string | null | undefined): string | undefined {
    const country = value?.trim().toUpperCase() ?? '';

    // Cloudflare uses XX for unknown and T1 for Tor, which are not ISO codes.
    if (!/^[A-Z]{2}$/.test(country) || country === 'XX' || country === 'T1') {
        return undefined;
    }

    return country;
}

/**
 * Parse a country chosen by the visitor: only assigned ISO 3166-1 alpha-2 codes are accepted.
 */
export function parseCountryChoice(value: string | null | undefined): string | undefined {
    const country = normalizeCountryCode(value);
    return country && COUNTRY_CODE_SET.has(country) ? country : undefined;
}

/**
 * The locales to format country names with: the site's, when valid, then English.
 */
export function getCountryLocales(locale: string): string[] {
    try {
        return [...Intl.getCanonicalLocales(locale), 'en'];
    } catch {
        return ['en'];
    }
}

function createCountryDisplayNames(locales: string[]): Intl.DisplayNames | null {
    try {
        return new Intl.DisplayNames(locales, { type: 'region', fallback: 'code' });
    } catch {
        return null;
    }
}

function formatCountryName(country: string, displayNames: Intl.DisplayNames | null): string {
    try {
        return displayNames?.of(country) ?? country;
    } catch {
        return country;
    }
}

/**
 * Get the name of a country in a locale, falling back to its code.
 */
export function getCountryName(country: string, locale: string): string {
    return formatCountryName(country, createCountryDisplayNames(getCountryLocales(locale)));
}

export type CountryEntry = { code: string; name: string };

/** A group of the country picker: a site region, or every country in no region. */
export type CountryGroup =
    | { type: 'region'; name: string; label: string; countries: CountryEntry[] }
    | { type: 'other'; countries: CountryEntry[] };

/**
 * Get countries with their name in a locale, sorted by name.
 */
export function getCountryList(
    locale: string,
    countryCodes: readonly string[] = COUNTRY_CODES
): CountryEntry[] {
    const locales = getCountryLocales(locale);
    const displayNames = createCountryDisplayNames(locales);
    const collator = new Intl.Collator(locales);

    return countryCodes
        .map((code) => ({ code, name: formatCountryName(code, displayNames) }))
        .sort((a, b) => collator.compare(a.name, b.name));
}

/**
 * Group countries by the site's regions, in declaration order, then the rest under "other".
 * Each group is sorted by localized name, and empty groups are left out.
 */
export function groupCountriesByRegion(
    regions: { [name: string]: { label?: string; countries: string[] } } | null | undefined,
    countryCodes: readonly string[],
    locale: string
): CountryGroup[] {
    const countries = getCountryList(locale, countryCodes);
    const assigned = new Set<string>();
    const groups: CountryGroup[] = [];

    for (const [name, region] of Object.entries(regions ?? {})) {
        // The API keeps each country in one region; the first one wins should that change.
        const codes = new Set(
            region.countries.map((code) => code.toUpperCase()).filter((code) => !assigned.has(code))
        );
        codes.forEach((code) => assigned.add(code));
        const regionCountries = countries.filter((country) => codes.has(country.code));
        if (regionCountries.length > 0) {
            groups.push({
                type: 'region',
                name,
                label: region.label?.trim() || name,
                countries: regionCountries,
            });
        }
    }

    const otherCountries = countries.filter((country) => !assigned.has(country.code));
    if (otherCountries.length > 0) {
        groups.push({ type: 'other', countries: otherCountries });
    }
    return groups;
}

/**
 * The flag emoji of a country, from the regional indicator symbols of its code.
 */
export function getCountryFlag(country: string): string {
    return String.fromCodePoint(
        ...[...country.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65)
    );
}
