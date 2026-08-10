import { describe, expect, it } from 'bun:test';

import { colorScale } from './transformations';

describe('colorScale exact base', () => {
    it('takes a very light tint as the exact background on step 1 (clean/bold)', () => {
        const scale = colorScale('#F5F3EF', { baseStep: 1 });
        expect(scale[0]).toBe('#F5F3EF');
    });

    it('anchors a very light tint to step 2 when the theme uses the subtle step (muted)', () => {
        const scale = colorScale('#F5F3EF', { baseStep: 2 });
        expect(scale[1]).toBe('#F5F3EF');
        // Step 1 sits just above the exact base, toward white.
        expect(scale[0]).not.toBe('#F5F3EF');
        expect(scale[0]).not.toBe('#ffffff');
    });

    it('takes a darker-than-dark tint as the exact background, preserving hue and chroma', () => {
        const scale = colorScale('#0B0F19', { darkMode: true, baseStep: 1 });
        expect(scale[0]).toBe('#0B0F19');
    });

    it('does not trigger for a normal mid-lightness tint', () => {
        const scale = colorScale('#787878', { baseStep: 2 });
        // The default white background is kept; the tint only colors the scale.
        expect(scale[0]).toBe('#ffffff');
        expect(scale[1]).not.toBe('#787878');
    });

    it('does not trigger for a saturated light color, keeping the normal accent ramp', () => {
        // Light enough (L≈0.93) to pass the lightness bound, but too chromatic to read as a
        // background — emitting it verbatim would leave a vivid step 1 above a near-gray scale.
        const scale = colorScale('#FFEB3B', { baseStep: 1 });
        expect(scale[0]).toBe('#ffffff');
        expect(scale[0]).not.toBe('#FFEB3B');
    });

    it('respects a custom light background instead of overriding it with the tint', () => {
        // The color is darker than the requested background, so it is not the extreme end and the
        // supplied base must be preserved rather than overwritten.
        const scale = colorScale('#eeeeee', { baseStep: 1, background: '#f8f8f8' });
        expect(scale[0]).not.toBe('#eeeeee');
    });

    it('anchors an exact base even when a neutral mix is supplied (tint === primary)', () => {
        // getTintMixColor blends neutral into the tint when it equals the primary color; that must
        // not darken a near-white tint out of the exact-base path.
        const scale = colorScale('#F5F3EF', {
            baseStep: 1,
            mix: { color: '#787878', ratio: 0.4 },
        });
        expect(scale[0]).toBe('#F5F3EF');
    });

    it('does not trigger for a light accent color below the near-white threshold', () => {
        // #D8DEEC (light blue-gray, L≈0.90) is a UI accent, not a background, so it must not anchor.
        const scale = colorScale('#D8DEEC', { baseStep: 1 });
        expect(scale[0]).toBe('#ffffff');
        expect(scale[0]).not.toBe('#D8DEEC');
    });

    it('never anchors when no baseStep is given (accent scales and the bold theme)', () => {
        // A scale that does not define the page background opts out of the exact base entirely.
        const scale = colorScale('#F5F3EF', {});
        expect(scale[0]).toBe('#ffffff');
        expect(scale[0]).not.toBe('#F5F3EF');
    });
});
