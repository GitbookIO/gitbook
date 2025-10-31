/**
 * Calculates the ideal cover image dimensions based on the cover type,
 * page layout, and viewport constraints.
 *
 * The dimensions are optimized for:
 * - Hero covers: max-w-3xl (768px) on regular pages, max-w-screen-2xl (1536px) on wide pages
 * - Full covers: Can expand to full viewport width with negative margins (up to ~1920px+ on large screens)
 * - Responsive sizes: 768px (mobile), 1024px (tablet), up to 1920px+ (large desktop)
 *
 * The recommended aspect ratio is optimized to work well across all these scenarios.
 */

export const DEFAULT_COVER_HEIGHT = 240;

/**
 * Calculate recommended cover image dimensions based on actual rendering widths.
 *
 * Analysis of actual rendering widths:
 * - Hero, regular page: max-w-3xl = 768px
 * - Hero, wide page: max-w-screen-2xl = 1536px
 * - Full cover (mobile): ~768px (full viewport minus padding)
 * - Full cover (tablet): ~1024px (full viewport minus padding)
 * - Full cover (desktop): Can be 768px (hero regular) to ~1920px (full wide) on large screens
 *
 * The recommended aspect ratio (4:1) is a standard format that works well for:
 * - Default height of 240px → 960px width (close to tablet size of 1024px)
 * - Works well when cropped to 768px (hero regular), 1024px (tablet), 1536px (hero wide), and 1920px (full wide)
 * - With `object-cover`, images maintain their natural aspect ratio while filling the container,
 *   so the 4:1 ratio provides good coverage across all scenarios
 *
 * This ratio ensures images look good across all scenarios (hero/full, regular/wide, all viewports)
 * while maintaining good image quality for responsive srcSet generation and being easy to remember.
 *
 * @param height - The cover height in pixels (default: 240)
 * @returns Recommended width and height for the cover image
 */
export function getRecommendedCoverDimensions(height: number = DEFAULT_COVER_HEIGHT): {
    width: number;
    height: number;
} {
    // Standard 4:1 aspect ratio - a common and easy-to-work-with format
    // At 240px height: 960px width
    // This ratio works well for:
    // - Hero covers on regular pages (768px width) - image will scale to cover
    // - Hero covers on wide pages (1536px width) - image will scale to cover
    // - Full covers across all breakpoints (768px - 1920px+) - image will scale proportionally
    //
    // Since we use `object-cover`, the image will scale to fill the container while maintaining
    // its aspect ratio, so the 4:1 ratio provides excellent coverage across all scenarios.
    //
    // Examples for different heights:
    // - 240px height → 960px width (recommended for default)
    // - 400px height → 1600px width (recommended for taller covers)
    // - 500px height → 2000px width (recommended for very tall covers)
    const aspectRatio = 4;

    return {
        width: Math.round(height * aspectRatio),
        height,
    };
}

/**
 * Get the maximum cover width based on cover type and page layout.
 * Used for determining the upper bound of image dimensions.
 */
export function getMaxCoverWidth(coverType: 'hero' | 'full', isWidePage: boolean): number {
    if (coverType === 'hero') {
        // Hero covers: max-w-3xl (768px) or max-w-screen-2xl (1536px)
        return isWidePage ? 1536 : 768;
    }
    // Full covers can expand to viewport width, typically up to 1920px on large screens
    // Accounting for some margins, we use 1920px as the maximum
    return 1920;
}
