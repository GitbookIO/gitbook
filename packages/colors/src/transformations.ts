import { DARK_BASE, DEFAULT_TINT_COLOR, LIGHT_BASE } from './colors';

type ColorShades = {
    [key: string]: string;
};

type RGBColor = [number, number, number];
type OKLABColor = { L: number; A: number; B: number };
type OKLCHColor = { L: number; C: number; H: number };

const D65 = [95.047, 100.0, 108.883]; // Reference white (D65)

export enum ColorCategory {
    backgrounds = 'backgrounds',
    components = 'components',
    borders = 'borders',
    accents = 'accents',
    text = 'text',
}

type ColorSubScale = {
    [key: string]: number;
};

/**
 * Main color scale object.
 *
 * Each `ColorCategory` can be in/excluded in Tailwind's utility classes generation.
 * Each subitem maps a semantic name within that category to a step in the scale.
 */
export const scale: Record<ColorCategory, ColorSubScale> = {
    [ColorCategory.backgrounds]: {
        /** Base background */
        base: 1,
        /** Accent background */
        subtle: 2,
    },
    [ColorCategory.components]: {
        /** Component background */
        DEFAULT: 3,
        /** Component hover background */
        hover: 4,
        /** Component active background */
        active: 5,
    },
    [ColorCategory.borders]: {
        /** Subtle borders, separators */
        subtle: 6,
        /** Element border, focus rings */
        DEFAULT: 7,
        /** Element hover border */
        hover: 8,
    },
    [ColorCategory.accents]: {
        /** Solid backgrounds */
        solid: 9,
        /** Hovered solid backgrounds */
        'solid-hover': 10,
    },
    [ColorCategory.text]: {
        /** Very low-contrast text
         * Caution: this contrast does not meet accessiblity guidelines.
         * Always check if you need to include a mitigating contrast-more style for users who need it. */
        subtle: 9,
        /** Low-contrast text */
        DEFAULT: 11,
        /** High-contrast text */
        strong: 12,
    },
};

/**
 * The mix of foreground and background for every step in a colour scale.
 * 0: 100% of the background color's luminosity, white in light mode
 * 1: 100% of the foreground color's luminosity, black in light mode
 */
export const colorMixMapping = {
    // bgs          |components      |borders         |solid     |text
    light: [0, 0.02, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.5, 0.55, 0.6, 1],
    dark: [0, 0.03, 0.08, 0.1, 0.13, 0.15, 0.2, 0.25, 0.5, 0.55, 0.75, 1],
};

/**
 * Convert a hex color to an RGB color.
 */
export function hexToRgb(hex: string): string {
    const [r, g, b] = hexToRgbArray(hex);
    // Return the RGB values separated by spaces
    return `${r} ${g} ${b}`;
}

/**
 * Convert a hex color to a RGBA color.
 */
export function hexToRgba(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgbArray(hex);
    // Return the RGBA values separated by spaces
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generate Tailwind-compatible shades from a single color
 * @param {string} hex The hex code to generate shades from
 * @param {boolean} halfShades Generate additional shades, e.g. at 150
 * @returns {{[key: number]: string}}
 */
export function shadesOfColor(hex: string, halfShades = false) {
    const baseColor = hex;

    const shades = [
        50,
        100,
        200,
        300,
        400,
        500,
        600,
        700,
        800,
        900,
        ...(halfShades ? [150, 250, 350, 450, 550, 650, 750, 850] : []),
    ].sort();

    const result: ColorShades = {};

    for (const shade of shades) {
        const key = shade.toString();

        if (shade === 500) {
            result[key] = hex;
            continue;
        }

        let shadeIndex = shade;
        const isDarkShade = shadeIndex > 500;
        if (isDarkShade) {
            shadeIndex -= 500;
        }

        const percentage = shadeIndex / 500;
        const startColor = isDarkShade ? DARK_BASE : baseColor;
        const endColor = isDarkShade ? baseColor : LIGHT_BASE;

        result[key] = getColor(percentage, hexToRgbArray(startColor), hexToRgbArray(endColor));
    }

    return result;
}

export type ColorScaleOptions = {
    /** If set to `true`, inverts the scale (so 1 is black instead of white) and uses `colorMixMapping.dark` with different mix ratios per step. */
    darkMode?: boolean;

    /** Define a custom background color to use. If left undefined, the global `light`/`dark` values (in `colors.ts`) will be used. */
    background?: string;

    /** Define a custom foreground color to use. If left undefined, the global `light`/`dark` values (in `colors.ts`) will be used. */
    foreground?: string;

    mix?: {
        /** If set to a hex code, this color will be additionally mixed into the generated scale according to `mix.ratio`. */
        color: string;

        /** Define a custom mix ratio to mix the `mix` color with. If left undefined, the default ratio will be used. */
        ratio: number;
    };
};

/**
 * Generate a [Radix-like](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) colour scale based of a hex colour.
 * @param {string} hex The hex code to generate shades from
 * @param {object} options
 */
export function colorScale(
    hex: string,
    {
        darkMode = false,
        background = darkMode ? DARK_BASE : LIGHT_BASE,
        foreground = darkMode ? LIGHT_BASE : DARK_BASE,
        mix,
    }: ColorScaleOptions = {}
) {
    const baseColor = rgbToOklch(hexToRgbArray(hex));
    const mixColor = mix?.color ? rgbToOklch(hexToRgbArray(mix.color)) : null;
    const foregroundColor = rgbToOklch(hexToRgbArray(foreground));
    const backgroundColor = rgbToOklch(hexToRgbArray(background));
    let mapping = darkMode ? colorMixMapping.dark : colorMixMapping.light;

    if (mixColor && mix?.ratio && mix.ratio > 0) {
        // If defined, we mix in a (tiny) bit of the mix color with the base color.
        baseColor.L = mixColor.L * mix.ratio + baseColor.L * (1 - mix.ratio);
        baseColor.C = mixColor.C * mix.ratio + baseColor.C * (1 - mix.ratio);
        baseColor.H = mix.color === DEFAULT_TINT_COLOR ? baseColor.H : mixColor.H;
    }

    if (
        (darkMode && baseColor.L < backgroundColor.L) ||
        (!darkMode && baseColor.L > backgroundColor.L)
    ) {
        // If the supplied color is outside of our lightness bounds, use the supplied color's lightness.
        // This is mostly used to allow darker-than-dark backgrounds for brands that specifically want that look.
        const difference = (backgroundColor.L - baseColor.L) / backgroundColor.L;
        backgroundColor.L = baseColor.L;
        // At the edges of the scale, the subtle lightness changes stop being perceptible. We need to amp up our mapping to still stand out.
        const amplifier = 1;
        mapping = mapping.map((step, index) =>
            index < 9 ? step + step * amplifier * difference : step
        );
    }

    const result = [];

    for (let index = 0; index < mapping.length; index++) {
        const targetL =
            foregroundColor.L * mapping[index] + backgroundColor.L * (1 - mapping[index]);

        if (index === 8 && !mix && Math.abs(baseColor.L - targetL) < 0.2) {
            // Original colour is close enough to target, so let's use the original colour as step 9.
            result.push(hex);
            continue;
        }

        const chromaRatio = index < 8 ? (index + 1) * 0.05 : 1;

        const shade = {
            L: targetL, // Blend lightness
            C: baseColor.C * chromaRatio,
            H: baseColor.H, // Maintain the hue from the base color
        };

        const newHex = rgbArrayToHex(oklchToRgb(shade));

        result.push(newHex);
    }

    return result;
}

/**
 * Convert a hex color to an RGB color set.
 */
export function hexToRgbArray(hex: string): RGBColor {
    const originalHex = hex;

    let value = hex.replace('#', '');
    if (hex.length === 3) value = value + value;

    const r = value.substring(0, 2);
    const g = value.substring(2, 4);
    const b = value.substring(4, 6);

    const rgb = [r, g, b].map((channel) => {
        try {
            const channelInt = Number.parseInt(channel, 16);
            if (channelInt < 0 || channelInt > 255) throw new Error();
            return channelInt;
        } catch {
            throw new Error(`Invalid hex color provided: ${originalHex}`);
        }
    });

    return rgb as RGBColor;
}

/**
 * Convert a RGB color set to a hex color.
 */
export function rgbArrayToHex(rgb: RGBColor): string {
    return `#${rgb
        .map((channel) => {
            const component = channel.toString(16);
            if (component.length === 1) return `0${component}`;
            return component;
        })
        .join('')}`;
}

export function getColor(percentage: number, start: RGBColor, end: RGBColor) {
    const rgb = end.map((channel, index) => {
        return Math.round(channel + percentage * (start[index] - channel));
    });

    return rgbArrayToHex(rgb as RGBColor);
}

// Utility constants and helper functions
export function rgbToLinear(rgb: RGBColor): [number, number, number] {
    return rgb.map((v) => {
        const scaled = v / 255;
        return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
}

export function linearToRgb(linear: [number, number, number]): RGBColor {
    return linear.map((v) => {
        const scaled = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
        return Math.round(Math.max(0, Math.min(1, scaled)) * 255);
    }) as RGBColor;
}

export function rgbToOklab(rgb: RGBColor): OKLABColor {
    const [r, g, b] = rgbToLinear(rgb);

    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    const lRoot = Math.cbrt(l);
    const mRoot = Math.cbrt(m);
    const sRoot = Math.cbrt(s);

    return {
        L: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
        A: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
        B: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
    };
}

export function oklabToRgb(oklab: OKLABColor): RGBColor {
    const { L, A, B } = oklab;

    const lRoot = L + 0.3963377774 * A + 0.2158037573 * B;
    const mRoot = L - 0.1055613458 * A - 0.0638541728 * B;
    const sRoot = L - 0.0894841775 * A - 1.291485548 * B;

    const l = lRoot ** 3;
    const m = mRoot ** 3;
    const s = sRoot ** 3;

    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    return linearToRgb([r, g, b]);
}

export function oklabToOklch(oklab: OKLABColor): OKLCHColor {
    const { L, A, B } = oklab;
    const C = Math.sqrt(A ** 2 + B ** 2);
    const H = (Math.atan2(B, A) * 180) / Math.PI;
    return { L, C, H: H < 0 ? H + 360 : H };
}

export function oklchToOklab(oklch: OKLCHColor): OKLABColor {
    const { L, C, H } = oklch;
    const rad = (H * Math.PI) / 180;
    return {
        L,
        A: C * Math.cos(rad),
        B: C * Math.sin(rad),
    };
}

export function rgbToOklch(rgb: RGBColor): OKLCHColor {
    return oklabToOklch(rgbToOklab(rgb));
}

export function oklchToRgb(oklch: OKLCHColor): RGBColor {
    return oklabToRgb(oklchToOklab(oklch));
}

export function rgbToXyz(rgb: RGBColor): [number, number, number] {
    const [r, g, b] = rgbToLinear(rgb);
    return [
        (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
        (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100,
        (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100,
    ];
}

export function xyzToLab65(xyz: [number, number, number]): {
    L: number;
    A: number;
    B: number;
} {
    const [x, y, z] = xyz.map((v, i) => {
        const scaled = v / D65[i];
        return scaled > 0.008856 ? Math.cbrt(scaled) : 7.787 * scaled + 16 / 116;
    });

    return {
        L: 116 * y - 16,
        A: 500 * (x - y),
        B: 200 * (y - z),
    };
}

export function rgbTolab65(rgb: RGBColor): { L: number; A: number; B: number } {
    return xyzToLab65(rgbToXyz(rgb));
}

/*
  Delta Phi Star perceptual lightness contrast by Andrew Somers:
  https://github.com/Myndex/deltaphistar 
*/
export const PHI = 0.5 + Math.sqrt(1.25);

export function dpsContrast(a: RGBColor, b: RGBColor) {
    const dps = Math.abs(rgbTolab65(a).L ** PHI - rgbTolab65(b).L ** PHI);
    const contrast = dps ** (1 / PHI) * Math.SQRT2 - 40;
    return contrast < 7.5 ? 0 : contrast;
}

export function colorContrast(background: string, foreground: string[] = [LIGHT_BASE, DARK_BASE]) {
    const bg = hexToRgbArray(background);

    const best: { color?: RGBColor; contrast: number } = {
        color: undefined,
        contrast: 0,
    };
    for (const color of foreground) {
        const c = hexToRgbArray(color);

        const contrast = dpsContrast(c, bg);
        if (contrast > best.contrast) {
            best.color = c;
            best.contrast = contrast;
        }
    }

    return best.color ? rgbArrayToHex(best.color) : foreground[0];
}
