'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { tString, useLanguage } from '@/intl/client';

import { Button, type ButtonProps } from '../primitives';

const globalClassName = 'navigation-open';

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenu(props: ButtonProps) {
    const language = useLanguage();

    const pathname = usePathname();

    // Close the navigation when navigating to a page
    useEffect(() => {
        document.body.classList.remove(globalClassName);
    }, [pathname]);

    return (
        <Button
            icon="bars"
            iconOnly
            variant="blank"
            label={tString(language, 'table_of_contents_button_label')}
            onClick={() => {
                document.body.classList.toggle(globalClassName);
            }}
            // Since the button is hidden behind the TOC after toggling, we don't need to keep track of its active state.
            {...props}
        />
    );
}
