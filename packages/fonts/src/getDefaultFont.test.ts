import { describe, expect, it } from 'bun:test';
import { CustomizationDefaultFont } from '@gitbook/api';
import { getDefaultFont } from './getDefaultFont';

describe('getDefaultFont', () => {
    it('should return null for invalid font', () => {
        const result = getDefaultFont({
            font: 'invalid-font' as CustomizationDefaultFont,
            text: 'Hello',
            weight: 400,
        });
        expect(result).toBeNull();
    });

    it('should return null for invalid weight', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: 999 as any,
        });
        expect(result).toBeNull();
    });

    it('should return null for text not supported by any script', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: '😀', // Emoji not supported by Inter
            weight: 400,
        });
        expect(result).toBeNull();
    });

    it('should return correct object for Latin text', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello World',
            weight: 400,
        });
        expect(result).not.toBeNull();
        expect(result?.font).toBe(CustomizationDefaultFont.Inter);
        expect(result).toMatchSnapshot();
    });

    it('should return correct object for Cyrillic text', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Привет мир',
            weight: 400,
        });
        expect(result).not.toBeNull();
        expect(result?.font).toBe(CustomizationDefaultFont.Inter);
        expect(result).toMatchSnapshot();
    });

    it('should return correct object for Greek text', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Γεια σας',
            weight: 400,
        });
        expect(result).not.toBeNull();
        expect(result?.font).toBe(CustomizationDefaultFont.Inter);
        expect(result).toMatchSnapshot();
    });

    it('should handle mixed script text', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello Привет',
            weight: 400,
        });
        expect(result).not.toBeNull();
        expect(result?.font).toBe(CustomizationDefaultFont.Inter);
        expect(result).toMatchSnapshot();
    });

    it('should handle different font weights', () => {
        const regular = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: 400,
        });
        const bold = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: 700,
        });
        expect(regular).not.toBeNull();
        expect(bold).not.toBeNull();
        expect(regular).toMatchSnapshot('regular');
        expect(bold).toMatchSnapshot('bold');
    });

    it('should handle empty string', () => {
        const result = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: '',
            weight: 400,
        });
        expect(result).toBeNull();
    });

    it('should handle different fonts', () => {
        const inter = getDefaultFont({
            font: CustomizationDefaultFont.Inter,
            text: 'Hello',
            weight: 400,
        });
        const roboto = getDefaultFont({
            font: CustomizationDefaultFont.Roboto,
            text: 'Hello',
            weight: 400,
        });
        expect(inter).not.toBeNull();
        expect(roboto).not.toBeNull();
        expect(inter).toMatchSnapshot('inter');
        expect(roboto).toMatchSnapshot('roboto');
    });
});
