export function hexToRgb(hex: string): string {
    // Remove the hash at the beginning of the hex string if it exists
    let sanitizedHex = hex.replace('#', '');

    // If the hex is shorthand (3 characters), expand it to 6 characters
    if (sanitizedHex.length === 3) {
        sanitizedHex = sanitizedHex
            .split('')
            .map((char) => char + char)
            .join('');
    }

    // Convert the hex to an integer and extract the RGB components
    const intVal = parseInt(sanitizedHex, 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;

    // Return the RGB values separated by spaces
    return `${r} ${g} ${b}`;
}
