'use client';

import React from 'react';

/**
 * Client component to toggle the global class `page-full-width` on the body element.
 * It indicates that the page is rendered full width.
 */
export function TogglePageFullWidth() {
    React.useLayoutEffect(() => {
        document.body.classList.add('page-full-width');

        return () => {
            document.body.classList.remove('page-full-width');
        };
    });

    return null;
}
