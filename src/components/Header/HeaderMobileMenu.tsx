'use client';

import { IconMenu } from '@/components/icons/IconMenu';
import { tcls } from '@/lib/tailwind';

export const HeaderMobileMenu = (props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>) => {
    const toggleNavigation = () => {
        if (document.body.classList.contains('navigation-visible')) {
            document.body.classList.remove('navigation-visible');
        } else {
            document.body.classList.add('navigation-visible');
        }
    };
    return (
        <button {...props} onClick={toggleNavigation}>
            <IconMenu
                className={tcls(
                    'w-8',
                    'h-8',
                    'bg-dark/2',
                    'rounded',
                    'border',
                    'hover:bg-dark/3',
                    'border-dark/1',
                    'p-[0.25rem]',
                    'dark:bg-light/1',
                    'dark:border-light/1',
                    'dark:hover:bg-light/2',
                )}
            />
        </button>
    );
};
