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

        // The header is a `body:has()` subject, so touching its classes re-styles the whole
        // document. Only correct it when a previous page left it disagreeing with this one, and
        // stamp this page's layout on it as the page leaves, which is when the next one needs it.
        syncLayoutClasses(header, { wideLayout, pageHasToc }, false);
        return () => {
            syncLayoutClasses(header, { wideLayout, pageHasToc }, true);
        };
    }, [wideLayout, pageHasToc]);

    return null;
}

function syncLayoutClasses(
    header: Element,
    layout: { wideLayout: boolean; pageHasToc: boolean },
    force: boolean
) {
    const pairs: [wanted: string, other: string][] = [
        layout.wideLayout ? ['layout-wide', 'layout-default'] : ['layout-default', 'layout-wide'],
        layout.pageHasToc ? ['page-has-toc', 'page-no-toc'] : ['page-no-toc', 'page-has-toc'],
    ];
    for (const [wanted, other] of pairs) {
        if (header.classList.contains(other)) {
            header.classList.remove(other);
            header.classList.add(wanted);
        } else if (force && !header.classList.contains(wanted)) {
            header.classList.add(wanted);
        }
    }
}
