'use client';

import { Icon } from '@gitbook/icons';
import { useEffect } from 'react';

import { useMobileMenuSheet } from '@/components/Header/mobile-menu/useMobileMenuSheet';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { usePathname } from 'next/navigation';

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenuButton(
    props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>
) {
    const language = useLanguage();
    const pathname = usePathname();
    const { open, setOpen } = useMobileMenuSheet();

    const toggleNavigation = () => {
        setOpen(!open);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: Close the navigation when navigating to a page
    useEffect(() => {
        if (!open) return;
        setOpen(false);
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
