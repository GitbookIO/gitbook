'use client';
import * as React from 'react';

const LAYOUT_MODE_CLASSES = ['layout-default', 'layout-openapi', 'layout-full-width'] as const;

/**
 * This component preserves the layout of the page while loading a new one.
 * This approach is needed as page layout is done using CSS (`body:has(.layout-*)`),
 * which becomes false while transitioning between the 2 page states:
 *
 * 1. Page 1 with layout mode: `body:has(.layout-default)` is true
 * 2. Loading skeleton while transitioning to page 2: `body:has(.layout-default)` is false
 * 3. Page 2 with layout mode: `body:has(.layout-default)` is true
 *
 * This component ensures that the layout is preserved while transitioning between the 2 page states (in step 2).
 * It also preserves the page TOC state (page-has-toc/page-no-toc) to prevent logo sizing issues during navigation.
 */
export function PreservePageLayout(props: {
    siteWidthWide: boolean;
    layoutMode: (typeof LAYOUT_MODE_CLASSES)[number];
    hasTOC: boolean;
}) {
    const { siteWidthWide, layoutMode, hasTOC } = props;

    React.useLayoutEffect(() => {
        // We use the header as it's an element preserved between page transitions
        // (rendered in the layout component).
        const header = document.querySelector('header');
        if (!header) {
            return;
        }

        // Clear all layout mode classes first
        for (const cls of LAYOUT_MODE_CLASSES) {
            header.classList.remove(cls);
        }

        // Add current layout mode
        header.classList.add(layoutMode);

        if (siteWidthWide) {
            header.classList.add('site-width-wide');
        } else {
            header.classList.remove('site-width-wide');
        }

        // Preserve page TOC state to prevent logo sizing issues during navigation
        if (hasTOC) {
            header.classList.add('page-has-toc');
            header.classList.remove('page-no-toc');
        } else {
            header.classList.add('page-no-toc');
            header.classList.remove('page-has-toc');
        }
    }, [siteWidthWide, layoutMode, hasTOC]);

    return null;
}
