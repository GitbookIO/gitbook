type ColorShades = {
    [key: string]: string;
};

type RGBColor = [number, number, number];
type LABColor = { L: number; A: number; B: number };

const black: RGBColor = [0, 0, 0];
const white: RGBColor = [255, 255, 255];

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
    const baseColor = hexToRgbArray(hex);

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
        const startColor = isDarkShade ? black : baseColor;
        const endColor = isDarkShade ? baseColor : white;

        result[key] = getColor(percentage, startColor, endColor);
    });

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

function getColor(
    percentage: number,
    start: [number, number, number],
    end: [number, number, number],
) {
    const rgb = end.map((channel, index) => {
        return Math.round(channel + percentage * (start[index] - channel));
    });

    return rgbArrayToHex(rgb as RGBColor);
}

function rgbToLab65([r, g, b]: RGBColor): LABColor {
    // Normalize RGB values (0-255 to 0-1)
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply gamma correction (sRGB to linear RGB)
    const linearize = (value: number) =>
        value > 0.04045 ? Math.pow((value + 0.055) / 1.055, 2.4) : value / 12.92;

    r = linearize(r);
    g = linearize(g);
    b = linearize(b);

    // Convert linear RGB to XYZ using D65 matrix
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

    // Normalize for D65 illuminant
    const Xn = 0.95047;
    const Yn = 1.0;
    const Zn = 1.08883;

    const X = x / Xn;
    const Y = y / Yn;
    const Z = z / Zn;

    // Convert XYZ to LAB
    const f = (value: number) => (value > 0.008856 ? Math.cbrt(value) : (value * 903.3 + 16) / 116);

    const fx = f(X);
    const fy = f(Y);
    const fz = f(Z);

    const L = 116 * fy - 16;
    const A = 500 * (fx - fy);
    const B = 200 * (fy - fz);

    return { L, A, B };
}

/*
  Delta Phi Star perceptual lightness contrast by Andrew Somers:
  https://github.com/Myndex/deltaphistar 
*/
const PHI = 0.5 + Math.sqrt(1.25);

export function dpsContrast(a: RGBColor, b: RGBColor) {
    const dps = Math.abs(Math.pow(rgbToLab65(a).L, PHI) - Math.pow(rgbToLab65(b).L, PHI));
    const contrast = Math.pow(dps, 1 / PHI) * Math.SQRT2 - 40;
    return contrast < 7.5 ? 0 : contrast;
}

export function colorContrast(background: string, foreground: string[]) {
    const bg = hexToRgbArray(background);

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
