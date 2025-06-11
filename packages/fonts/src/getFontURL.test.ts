import { describe, expect, it } from 'bun:test';
import { CustomizationDefaultFont } from '@gitbook/api';
import { getFontURL } from './getFontURL';

describe('getFontURL', () => {
    it('should return null for invalid font', () => {
        const result = getFontURL({
            font: 'invalid-font' as CustomizationDefaultFont,
            text: 'Hello',
            weight: '400',
        });
        expect(result).toBeNull();
    });

    it('should return null for invalid weight', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: '999' as any,
        });
        expect(result).toBeNull();
    });

    it('should return null for text not supported by any script', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: '😀', // Emoji not supported by Inter
            weight: '400',
        });
        expect(result).toBeNull();
    });

    it('should return correct URL for Latin text', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello World',
            weight: '400',
        });
        expect(result).toContain('inter');
        expect(result).toContain('latin');
    });

    it('should return correct URL for Cyrillic text', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Привет мир',
            weight: '400',
        });
        expect(result).toContain('inter');
        expect(result).toContain('cyrillic');
    });

    it.only('should return correct URL for Greek text', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Γεια σας',
            weight: '400',
        });
        console.log(result);
        expect(result).toContain('inter');
        expect(result).toContain('greek');
    });

    it('should handle mixed script text', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello Привет',
            weight: '400',
        });
        expect(result).toContain('inter');
        // Should return Latin URL since it's the first matching script
        expect(result).toContain('latin');
    });

    it('should handle different font weights', () => {
        const regular = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: '400',
        });
        const bold = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: '700',
        });
        expect(regular).not.toEqual(bold);
    });

    it('should handle empty string', () => {
        const result = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: '',
            weight: '400',
        });
        expect(result).toBeNull();
    });

    it('should handle different fonts', () => {
        const inter = getFontURL({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: '400',
        });
        const roboto = getFontURL({
            font: CustomizationDefaultFont.Roboto,
            text: 'Hello',
            weight: '400',
        });
        expect(inter).not.toEqual(roboto);
    });
});
