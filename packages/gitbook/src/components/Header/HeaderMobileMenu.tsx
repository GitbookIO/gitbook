'use client';

import { Icon } from '@gitbook/icons';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLanguage, tString } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

const globalClassName = 'navigation-open';

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenu(props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
    const language = useLanguage();
    const scrollDistance = 320;

    const pathname = usePathname();
    const [hasScrolled, setHasScrolled] = useState(false);

    const toggleNavigation = () => {
        if (!hasScrolled && document.body.classList.contains(globalClassName)) {
            document.body.classList.remove(globalClassName);
        } else {
            document.body.classList.add(globalClassName);
            window.scrollTo(0, 0);
        }
    };

    const handleScroll = () => {
        if (window.scrollY >= scrollDistance) {
            setHasScrolled(true);
        } else {
            setHasScrolled(false);
        }
    };

    // Close the navigation when navigating to a page
    useEffect(() => {
        document.body.classList.remove(globalClassName);
    }, [pathname]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <button
            {...props}
            aria-label={tString(language, 'table_of_contents_button_label')}
            onClick={toggleNavigation}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'hover:bg-dark/3',
                'py-1',
                'px-2',
                'dark:hover:bg-light/2',
                'rounded',
                'straight-corners:rounded-sm',
                'page-no-toc:hidden',
                props.className,
            )}
        >
            <Icon icon="bars" className={tcls('size-4', 'text-inherit')} />
        </button>
    );
}
