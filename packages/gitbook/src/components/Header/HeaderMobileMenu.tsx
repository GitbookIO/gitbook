'use client';

import { Icon } from '@gitbook/icons';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useScrollListener } from '../hooks/useScrollListener';

const globalClassName = 'navigation-open';

const SCROLL_DISTANCE = 320;

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenu(props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
    const language = useLanguage();

    const pathname = usePathname();
    const hasScrollRef = useRef(false);

    const toggleNavigation = () => {
        if (!hasScrollRef.current && document.body.classList.contains(globalClassName)) {
            document.body.classList.remove(globalClassName);
        } else {
            document.body.classList.add(globalClassName);
            window.scrollTo(0, 0);
        }
    };

    const windowRef = useRef(typeof window === 'undefined' ? null : window);
    useScrollListener(() => {
        hasScrollRef.current = window.scrollY >= SCROLL_DISTANCE;
    }, windowRef);

    // Close the navigation when navigating to a page
    useEffect(() => {
        document.body.classList.remove(globalClassName);
    }, [pathname]);

    return (
        <button
            {...props}
            aria-label={tString(language, 'table_of_contents_button_label')}
            onClick={toggleNavigation}
            className={tcls(
                'flex flex-row items-center rounded straight-corners:rounded-sm px-2 py-1',
                props.className
            )}
        >
            <Icon icon="bars" className="size-4 text-inherit" />
        </button>
    );
}
