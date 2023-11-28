type ColorShades = {
    [key: string]: string;
};

type RGBColor = [number, number, number];

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
