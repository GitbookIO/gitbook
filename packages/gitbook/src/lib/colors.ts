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
 * Generate a [Radix-like](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) colour scale based of a hex colour.
 *
 * ### Backgrounds
 * 1. Base background
 * 2. Subtle background
 *
 * ### Element Backgrounds
 * 3. Element background
 * 4. Element Hover background
 * 5. Element Active background
 *
 * ### Borders
 * 6. Subtle borders, separators
 * 7. Element border, focus rings
 * 8. Element hover border
 *
 * ### Solid backgrounds
 * 9. Solid backgrounds – The true colour, if the mode allows it
 * 10. Hovered solid backgrounds
 *
 * ### Text
 * 11. Low-contrast text
 * 12. High-contrast text
 */
export function colorScale(
    hex: string,
    withContrast: boolean = false,
    dark = '#000000',
    light = '#ffffff',
) {
    const baseColor = rgbToLab65(hexToRgbArray(hex));

    // Lightness value per step, used to generate the scale
    const mapping = [-0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2, -0.1, 0, 0.2, 0.7, 0.9];

    const result = [];

    for (let index = 0; index < 12; index++) {
        // const L = mapping[index];

        const mixColor =
            mapping[index] < 0 ? rgbToLab65(hexToRgbArray(dark)) : rgbToLab65(hexToRgbArray(light));
        const shade: LABColor = mixColors(baseColor, mixColor, Math.abs(mapping[index]));

        const hex = rgbArrayToHex(lab65ToRgb(shade));
        const contrast = withContrast ? colorContrast(hex, [light, dark]) : undefined;

        result.push({ color: hex, contrast: contrast });

        if (withContrast) {
            result;
        }
    }

    return result;
}

function mixColors(lab1: LABColor, lab2: LABColor, t: number): LABColor {
    return {
        L: lab1.L * (1 - t) + lab2.L * t,
        A: lab1.A * (1 - t) + lab2.A * t,
        B: lab1.B * (1 - t) + lab2.B * t,
    };
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

export function rgbToLab65([r, g, b]: RGBColor): LABColor {
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

function lab65ToRgb({ L, A, B }: LABColor): RGBColor {
    // Convert LAB to XYZ
    const Yn = 1.0;
    const Xn = 0.95047;
    const Zn = 1.08883;

    const fy = (L + 16) / 116;
    const fx = A / 500 + fy;
    const fz = fy - B / 200;

    const fInv = (value: number) =>
        value > 0.206893034 ? Math.pow(value, 3) : (value - 16 / 116) / 7.787;

    const X = Xn * fInv(fx);
    const Y = Yn * fInv(fy);
    const Z = Zn * fInv(fz);

    // Convert XYZ to linear RGB
    const rLinear = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
    const gLinear = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
    const bLinear = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

    // Convert linear RGB to sRGB
    const gammaCorrect = (value: number) =>
        value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

    const r = gammaCorrect(Math.max(0, Math.min(1, rLinear)));
    const g = gammaCorrect(Math.max(0, Math.min(1, gLinear)));
    const b = gammaCorrect(Math.max(0, Math.min(1, bLinear)));

    // Convert to 0-255 range and round
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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
