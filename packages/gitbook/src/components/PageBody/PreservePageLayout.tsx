'use client';
import * as React from 'react';

/**
 * This component preserves the layout of the page while loading a new one.
 * This approach is needed as page layout is done using CSS (`body:has(.layout-wide)`),
 * which becomes false while transitioning between the 2 page states:
 *
 * 1. Page 1 with wide layout: `body:has(.layout-wide)` is true
 * 2. Loading skeleton while transitioning to page 2: `body:has(.layout-wide)` is false
 * 3. Page 2 with wide layout: `body:has(.layout-wide)` is true
 *
 * This component ensures that the layout is preserved while transitioning between the 2 page states (in step 2).
 * It also preserves the page TOC state (page-has-toc/page-no-toc) to prevent logo sizing issues during navigation.
 */
export function PreservePageLayout(props: { wideLayout: boolean; pageHasToc: boolean }) {
    const { wideLayout, pageHasToc } = props;

    React.useLayoutEffect(() => {
        // We use the header as it's an element preserved between page transitions
        // (rendered in the layout component).
        const header = document.querySelector('header');
        if (!header) {
            return;
        }

        if (wideLayout) {
            header.classList.add('layout-wide');
            header.classList.remove('layout-default');
        } else {
            header.classList.remove('layout-wide');
            header.classList.add('layout-default');
        }

        if (pageHasToc) {
            header.classList.add('page-has-toc');
            header.classList.remove('page-no-toc');
        } else {
            header.classList.add('page-no-toc');
            header.classList.remove('page-has-toc');
        }
    }, [wideLayout, pageHasToc]);

    return null;
}
