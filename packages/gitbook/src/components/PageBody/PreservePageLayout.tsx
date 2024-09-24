'use client';
import * as React from 'react';

/**
 * This component preserves the layout of the page while loading a new one.
 * This approach is needed as page layout (full width block) is done using CSS (`body:has(.page-full-width)`),
 * which becomes false while transitioning between the 2 page states:
 *
 * 1. Page 1 with full width block: `body:has(.page-full-width)` is true
 * 2. Loading skeleton while transitioning to page 2: `body:has(.page-full-width)` is false
 * 3. Page 2 with full width block: `body:has(.page-full-width)` is true
 *
 * This component ensures that the layout is preserved while transitioning between the 2 page states (in step 2).
 */
export function PreservePageLayout(props: { asFullWidth: boolean }) {
    const { asFullWidth } = props;

    React.useLayoutEffect(() => {
        // We use the header as it's an element preserved between page transitions
        // (rendered in the layout component).
        const header = document.querySelector('header');
        if (!header) {
            return;
        }

        if (asFullWidth) {
            header.classList.add('page-full-width');
        } else {
            header.classList.remove('page-full-width');
        }
    }, [asFullWidth]);

    return null;
}
