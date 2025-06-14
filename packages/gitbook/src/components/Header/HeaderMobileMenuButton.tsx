'use client';

import { Icon } from '@gitbook/icons';

import { useMobileMenuSheet } from '@/components/MobileMenu/useMobileMenuSheet';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

/**
 * Button to show/hide the table of content on mobile.
 */
export function HeaderMobileMenuButton(
    props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>
) {
    const language = useLanguage();
    const { open, setOpen } = useMobileMenuSheet();

    const toggleNavigation = () => {
        setOpen(!open);
    };

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
