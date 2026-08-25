import type { CustomizationFont, SiteCustomizationSettings } from '@gitbook/api';

/**
 * Font to render headings with, or `null` when they should use the content font.
 */
export function getHeadingFont(customization: SiteCustomizationSettings): CustomizationFont | null {
    const { headingFont, font } = customization.styling;
    if (!headingFont) {
        return null;
    }

    // Headings only need their own faces when they don't already come with the content font.
    return isSameFont(headingFont, font) ? null : headingFont;
}

function isSameFont(a: CustomizationFont, b: CustomizationFont): boolean {
    if (typeof a === 'string' || typeof b === 'string') {
        return a === b;
    }
    return a.id === b.id;
}
