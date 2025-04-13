'use client';

import { Icon } from '@gitbook/icons';
import { useRef } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { usePathnameChange } from '../hooks';
import { useScrollListener } from '../hooks/useScrollListener';

const globalClassName = 'navigation-open';


/**
 * Detect if the user has scrolled in the page, meaning the TOC is not visible.
 */
function useHasScrolledRef() {
    const hasScrollRef = useRef(false);
    const windowRef = useRef(typeof window === 'undefined' ? null : window);
    useScrollListener(() => {
        hasScrollRef.current = window.scrollY >= 320;
    }, windowRef);
    return hasScrollRef
}

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenu(props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
    const language = useLanguage();
    const hasScrollRef = useHasScrolledRef();

    // Close the navigation when navigating to a page
    usePathnameChange(() => {
        document.body.classList.remove(globalClassName);
    });

    const handleNavigationClick = () => {
        // If already opened
        if (document.body.classList.contains(globalClassName)) {
            // If the user has scrolled down, we need to scroll back to the top.
            if (hasScrollRef.current) {
                window.scrollTo(0, 0);
            }
            // Else we close the table of contents
            else {
                document.body.classList.remove(globalClassName);
            }
        }
        // If not opened, we open it an scroll to the top
        else {
            document.body.classList.add(globalClassName);
            window.scrollTo(0, 0);
        }
    }; 

    return (
        <button
            {...props}
            aria-label={tString(language, 'table_of_contents_button_label')}
            onClick={handleNavigationClick}
            className={tcls(
                'flex flex-row items-center rounded straight-corners:rounded-sm px-2 py-1',
                props.className
            )}
        >
            <Icon icon="bars" className="size-4 text-inherit" />
        </button>
    );
}
