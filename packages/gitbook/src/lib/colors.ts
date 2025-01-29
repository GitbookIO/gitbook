type ColorShades = {
    [key: string]: string;
};

type RGBColor = [number, number, number];
type OKLABColor = { L: number; A: number; B: number };
type OKLCHColor = { L: number; C: number; H: number };

const dark = '#1d1d1d';
const light = '#ffffff';
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

export const scale: Record<ColorCategory, ColorSubScale> = {
    [ColorCategory.backgrounds]: {
        base: 1, // Base background
        subtle: 2, // Accent background
    },
    [ColorCategory.components]: {
        DEFAULT: 3, // Component background
        hover: 4, // Component hover background
        active: 5, // Component active background
    },
    [ColorCategory.borders]: {
        subtle: 6, // Subtle borders, separators
        DEFAULT: 7, // Element border, focus rings
        hover: 8, // Element hover border
    },
    [ColorCategory.accents]: {
        solid: 9, // Solid backgrounds
        'solid-hover': 10, // Hovered solid backgrounds
    },
    [ColorCategory.text]: {
        subtle: 9, // Very low-contrast text — WARNING: this contrast does not meet accessiblity guidelines. Always include a mitigating contrast-more check for users who need it.
        DEFAULT: 11, // Low-contrast text
        strong: 12, // High-contrast text
    },
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

    shades.forEach((shade) => {
        const key = shade.toString();

        if (shade === 500) {
            result[key] = hex;
            return;
        }

        let shadeIndex = shade;
        const isDarkShade = shadeIndex > 500;
        if (isDarkShade) {
            shadeIndex -= 500;
        }

        const percentage = shadeIndex / 500;
        const startColor = isDarkShade ? dark : baseColor;
        const endColor = isDarkShade ? baseColor : light;

        result[key] = getColor(percentage, hexToRgbArray(startColor), hexToRgbArray(endColor));
    });

    return result;
}

/**
 * Generate a [Radix-like](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) colour scale based of a hex colour.
 */
export function colorScale(
    hex: string,
    {
        darkMode = false,
        background = darkMode ? dark : light,
        foreground = darkMode ? light : dark,
    }: {
        darkMode?: boolean;
        background?: string;
        foreground?: string;
    } = {},
) {
    const baseColor = rgbToOklch(hexToRgbArray(hex));
    const foregroundColor = rgbToOklch(hexToRgbArray(foreground));
    const backgroundColor = rgbToOklch(hexToRgbArray(background));

    const mapping = darkMode
        ? // bgs     |components      |borders         |solid     |text
          [1.0, 0.95, 0.92, 0.9, 0.87, 0.85, 0.8, 0.75, 0.5, 0.45, 0.25, 0]
        : [1.0, 0.98, 0.97, 0.95, 0.93, 0.9, 0.85, 0.8, 0.5, 0.45, 0.4, 0];

    const result = [];

    for (let index = 0; index < mapping.length; index++) {
        const targetL =
            backgroundColor.L * mapping[index] + foregroundColor.L * (1 - mapping[index]);

        if (index == 8 && Math.abs(baseColor.L - targetL) < 0.2) {
            // Original colour is close enough to target, so let's use the original colour as step 9.
            result.push(hex);
            continue;
        }

        // Mix in more of the background while maintaining chroma
        const mixRatio = index >= 8 ? 0 : 1 - (index + 1) / mapping.length; // Higher mixRatio means more background contribution

        const shade = {
            L: targetL, // Blend lightness
            C: baseColor.C * (1 - mixRatio),
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
function hexToRgbArray(hex: string): RGBColor {
    const originalHex = hex;

    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex + hex;

    const r = hex.substring(0, 2);
    const g = hex.substring(2, 4);
    const b = hex.substring(4, 6);

    const rgb = [r, g, b].map((channel) => {
        try {
            const channelInt = parseInt(channel, 16);
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
function rgbArrayToHex(rgb: RGBColor): string {
    return (
        '#' +
        rgb
            .map((channel) => {
                const component = channel.toString(16);
                if (component.length === 1) return '0' + component;
                return component;
            })
            .join('')
    );
}

function getColor(percentage: number, start: RGBColor, end: RGBColor) {
    const rgb = end.map((channel, index) => {
        return Math.round(channel + percentage * (start[index] - channel));
    });

    return rgbArrayToHex(rgb as RGBColor);
}

// Utility constants and helper functions
function rgbToLinear(rgb: RGBColor): [number, number, number] {
    return rgb.map((v) => {
        const scaled = v / 255;
        return scaled <= 0.04045 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
    }) as [number, number, number];
}

function linearToRgb(linear: [number, number, number]): RGBColor {
    return linear.map((v) => {
        const scaled = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.round(Math.max(0, Math.min(1, scaled)) * 255);
    }) as RGBColor;
}

function rgbToOklab(rgb: RGBColor): OKLABColor {
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

function oklabToRgb(oklab: OKLABColor): RGBColor {
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

function oklabToOklch(oklab: OKLABColor): OKLCHColor {
    const { L, A, B } = oklab;
    const C = Math.sqrt(A ** 2 + B ** 2);
    const H = (Math.atan2(B, A) * 180) / Math.PI;
    return { L, C, H: H < 0 ? H + 360 : H };
}

function oklchToOklab(oklch: OKLCHColor): OKLABColor {
    const { L, C, H } = oklch;
    const rad = (H * Math.PI) / 180;
    return {
        L,
        A: C * Math.cos(rad),
        B: C * Math.sin(rad),
    };
}

function rgbToOklch(rgb: RGBColor): OKLCHColor {
    return oklabToOklch(rgbToOklab(rgb));
}

function oklchToRgb(oklch: OKLCHColor): RGBColor {
    return oklabToRgb(oklchToOklab(oklch));
}

function rgbToXyz(rgb: RGBColor): [number, number, number] {
    const [r, g, b] = rgbToLinear(rgb);
    return [
        (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
        (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100,
        (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100,
    ];
}

function xyzToLab65(xyz: [number, number, number]): { L: number; A: number; B: number } {
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

function rgbTolab65(rgb: RGBColor): { L: number; A: number; B: number } {
    return xyzToLab65(rgbToXyz(rgb));
}

/*
  Delta Phi Star perceptual lightness contrast by Andrew Somers:
  https://github.com/Myndex/deltaphistar 
*/
const PHI = 0.5 + Math.sqrt(1.25);

export function dpsContrast(a: RGBColor, b: RGBColor) {
    const dps = Math.abs(Math.pow(rgbTolab65(a).L, PHI) - Math.pow(rgbTolab65(b).L, PHI));
    const contrast = Math.pow(dps, 1 / PHI) * Math.SQRT2 - 40;
    return contrast < 7.5 ? 0 : contrast;
}

export function colorContrast(background: string, foreground?: string[]) {
    const bg = hexToRgbArray(background);
    if (!foreground) {
        foreground = [light, dark];
    }

    let best: { color?: RGBColor; contrast: number } = { color: undefined, contrast: 0 };
    foreground.forEach((color) => {
        const c = hexToRgbArray(color);

        const contrast = dpsContrast(c, bg);
        if (contrast > best.contrast) {
            best.color = c;
            best.contrast = contrast;
        }
    });

    return best.color ? rgbArrayToHex(best.color) : foreground[0];
}
