import { type CustomizationFont, type SiteCustomizationSettings } from '@gitbook/api';

/**
 * TODO: remove once `@gitbook/api` ships `styling.headingFont`, and read it off
 * `SiteCustomizationSettings['styling']` directly.
 */
type StylingWithHeadingFont = SiteCustomizationSettings['styling'] & {
    headingFont?: CustomizationFont | null;
};

/**
 * Font to render headings with, or `null` when they should use the content font.
 */
export function getHeadingFont(customization: SiteCustomizationSettings): CustomizationFont | null {
    // TODO: drop the cast once the API ships `headingFont`.
    const styling = customization.styling as StylingWithHeadingFont;
    const headingFont = styling.headingFont;
    if (!headingFont) {
        return null;
    }

    // Headings only need their own faces when they don't already come with the content font.
    return isSameFont(headingFont, styling.font) ? null : headingFont;
}

function isSameFont(a: CustomizationFont, b: CustomizationFont): boolean {
    if (typeof a === 'string' || typeof b === 'string') {
        return a === b;
    }
    return a.id === b.id;
}
