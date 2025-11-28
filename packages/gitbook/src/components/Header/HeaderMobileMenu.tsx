'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { tString, useLanguage } from '@/intl/client';

import { useScrollListener } from '../hooks/useScrollListener';
import { Button, type ButtonProps } from '../primitives';

const globalClassName = 'navigation-open';

const SCROLL_DISTANCE = 320;

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenu(props: ButtonProps) {
    const language = useLanguage();

    const pathname = usePathname();
    const hasScrollRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);

    const toggleNavigation = () => {
        if (!hasScrollRef.current && document.body.classList.contains(globalClassName)) {
            document.body.classList.remove(globalClassName);
            setIsOpen(false);
        } else {
            document.body.classList.add(globalClassName);
            window.scrollTo(0, 0);
            setIsOpen(true);
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
        <Button
            icon="bars"
            iconOnly
            variant="blank"
            size="default"
            label={tString(language, 'table_of_contents_button_label')}
            onClick={toggleNavigation}
            active={isOpen}
            {...props}
        />
    );
}
