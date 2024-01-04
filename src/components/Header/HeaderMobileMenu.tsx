'use client';

import { useEffect, useState } from 'react';

import { IconMenu } from '@/components/icons/IconMenu';
import { useLanguage, tString } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export function HeaderMobileMenu(props: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
    const language = useLanguage();
    const scrollDistance = 320;
    const [hasScrolled, setHasScrolled] = useState(false);

    const toggleNavigation = () => {
        if (!hasScrolled && document.body.classList.contains('navigation-open')) {
            document.body.classList.remove('navigation-open');
        } else {
            document.body.classList.add('navigation-open');
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
        >
            <IconMenu
                className={tcls(
                    'w-7',
                    'h-7',
                    'rounded',
                    'text-inherit',
                    'hover:bg-dark/3',
                    'p-[0.25rem]',
                    'dark:hover:bg-light/2',
                )}
            />
        </button>
    );
}
