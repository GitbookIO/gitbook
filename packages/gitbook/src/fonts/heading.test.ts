import { describe, expect, it } from 'bun:test';

import { CustomizationDefaultFont, type SiteCustomizationSettings } from '@gitbook/api';

import { getHeadingFont } from './heading';
import { defaultCustomization } from '@/lib/utils';

const CUSTOM_FONT = {
    id: 'font_1',
    custom: true,
    fontFamily: 'Segoe UI',
    fontFaces: [{ weight: 400 as const, sources: [{ url: 'https://example.com/segoe.woff2' }] }],
};

function customization(
    styling: Partial<SiteCustomizationSettings['styling']>
): SiteCustomizationSettings {
    const base = defaultCustomization();
    return { ...base, styling: { ...base.styling, ...styling } };
}

describe('getHeadingFont', () => {
    it('returns null when no heading font is set', () => {
        expect(getHeadingFont(customization({}))).toBeNull();
    });

    it('returns the heading font when it differs from the content font', () => {
        const settings = customization({
            font: CustomizationDefaultFont.Inter,
            headingFont: CustomizationDefaultFont.Merriweather,
        });
        expect(getHeadingFont(settings)).toBe(CustomizationDefaultFont.Merriweather);
    });

    it('returns null when the heading font is the content font', () => {
        const settings = customization({
            font: CustomizationDefaultFont.Inter,
            headingFont: CustomizationDefaultFont.Inter,
        });
        expect(getHeadingFont(settings)).toBeNull();
    });

    it('compares custom fonts by id', () => {
        expect(
            getHeadingFont(customization({ font: CUSTOM_FONT, headingFont: CUSTOM_FONT }))
        ).toBeNull();
        expect(
            getHeadingFont(
                customization({
                    font: CUSTOM_FONT,
                    headingFont: { ...CUSTOM_FONT, id: 'font_2' },
                })
            )
        ).toMatchObject({ id: 'font_2' });
    });

    it('ignores a custom heading font when the content font is a default one', () => {
        const settings = customization({
            font: CustomizationDefaultFont.Inter,
            headingFont: CUSTOM_FONT,
        });
        expect(getHeadingFont(settings)).toMatchObject({ id: 'font_1' });
    });
});
