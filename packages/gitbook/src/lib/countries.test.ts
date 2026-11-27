import { describe, expect, it } from 'bun:test';

import {
    COUNTRY_CODES,
    type CountryGroup,
    getCountryFlag,
    getCountryList,
    getCountryName,
    groupCountriesByRegion,
    parseCountryChoice,
} from './countries';

describe('parseCountryChoice', () => {
    it('upper-cases assigned ISO 3166-1 alpha-2 codes', () => {
        expect(parseCountryChoice('fr')).toBe('FR');
        expect(parseCountryChoice(' US ')).toBe('US');
    });

    it.each([undefined, null, '', 'XX', 'T1', 'ZZ', 'EU', 'FRA', '1A'])('rejects %p', (value) => {
        expect(parseCountryChoice(value)).toBeUndefined();
    });
});

describe('getCountryName', () => {
    it('names the country in the locale', () => {
        expect(getCountryName('DE', 'fr')).toBe('Allemagne');
        expect(getCountryName('DE', 'en')).toBe('Germany');
    });

    it('falls back to English for an invalid locale', () => {
        expect(getCountryName('DE', 'not a locale')).toBe('Germany');
    });
});

describe('getCountryList', () => {
    it('lists every country sorted by its localized name', () => {
        const list = getCountryList('fr');
        const names = list.map((country) => country.name);

        expect(list).toHaveLength(249);
        expect(names).toEqual([...names].sort(new Intl.Collator('fr').compare));
        expect(list.find((country) => country.code === 'DE')?.name).toBe('Allemagne');
    });
});

/** Each group as `label: codes`, with "other" for the remaining countries. */
function summarize(groups: CountryGroup[]): string[] {
    return groups.map(
        (group) =>
            `${group.type === 'region' ? group.label : 'other'}: ${group.countries.map((country) => country.code).join(' ')}`
    );
}

describe('groupCountriesByRegion', () => {
    const codes = ['AU', 'CA', 'DE', 'ES', 'FR', 'JP', 'MX', 'US'];

    it('keeps the declaration order of regions and sorts their countries by localized name', () => {
        const groups = groupCountriesByRegion(
            {
                northAmerica: { label: 'North America', countries: ['US', 'MX', 'CA'] },
                europe: { label: 'Europe', countries: ['FR', 'DE', 'ES'] },
            },
            codes,
            'fr'
        );

        // In French: Allemagne, Espagne, France; Canada, États-Unis, Mexique.
        expect(summarize(groups)).toEqual([
            'North America: CA US MX',
            'Europe: DE ES FR',
            'other: AU JP',
        ]);
        expect(groups[0]).toMatchObject({ type: 'region', name: 'northAmerica' });
        expect(groups[1]?.countries[0]).toEqual({ code: 'DE', name: 'Allemagne' });
    });

    it('falls back to the region name when it has no label', () => {
        const groups = groupCountriesByRegion({ emea: { countries: ['FR'] } }, codes, 'en');

        expect(groups[0]).toMatchObject({ type: 'region', name: 'emea', label: 'emea' });
    });

    it('puts every country in no region under "other"', () => {
        const groups = groupCountriesByRegion(
            { europe: { label: 'Europe', countries: ['FR', 'DE'] } },
            COUNTRY_CODES,
            'en'
        );
        const other = groups.find((group) => group.type === 'other');

        expect(groups.map((group) => group.type)).toEqual(['region', 'other']);
        expect(other?.countries).toHaveLength(COUNTRY_CODES.length - 2);
        expect(other?.countries.map((country) => country.code)).not.toContain('FR');
    });

    it('ignores unknown codes, repeated countries and regions left empty', () => {
        const groups = groupCountriesByRegion(
            {
                europe: { label: 'Europe', countries: ['fr', 'ZZ'] },
                again: { label: 'Again', countries: ['FR'] },
                empty: { label: 'Empty', countries: [] },
            },
            codes,
            'en'
        );

        expect(summarize(groups)).toEqual(['Europe: FR', 'other: AU CA DE JP MX ES US']);
    });

    it.each([undefined, null, {}])('puts every country under "other" for regions %p', (regions) => {
        const groups = groupCountriesByRegion(regions, codes, 'en');

        expect(summarize(groups)).toEqual(['other: AU CA FR DE JP MX ES US']);
    });
});

describe('getCountryFlag', () => {
    it('builds the flag from regional indicator symbols', () => {
        expect(getCountryFlag('FR')).toBe('🇫🇷');
        expect(getCountryFlag('us')).toBe('🇺🇸');
    });
});
