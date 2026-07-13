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
        const scale = colorScale('#FFEB3B', {});
        expect(scale[0]).toBe('#ffffff');
        expect(scale[0]).not.toBe('#FFEB3B');
    });
});
