'use client';

import { Icon } from '@gitbook/icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useLanguage, tString } from '@/intl/client';
import { ClassValue, tcls } from '@/lib/tailwind';

import { useSearch } from './useSearch';

/**
 * Button to open the search modal.
 */
export function SearchButton(props: { children?: React.ReactNode; style?: ClassValue }) {
    const { style, children } = props;

    const language = useLanguage();
    const [, setSearchState] = useSearch();

    const onClick = () => {
        setSearchState({
            ask: false,
            global: false,
            query: '',
        });
    };

    return (
        <button
            onClick={onClick}
            aria-label={tString(language, 'search')}
            className={tcls(
                'flex',
                'flex-1',
                'flex-row',
                'justify-center',
                'items-center',
                'w-full',
                'px-3',
                'py-2',
                'gap-2',

                'bg-light',
                'dark:bg-dark',

                'ring-1',
                'ring-dark/1',
                'dark:ring-light/2',

                'shadow-sm',
                'shadow-dark/4',
                'dark:shadow-none',

                'text-dark/7',
                'dark:text-light-4/7',

                'rounded-lg',
                'straight-corners:rounded-sm',

                'contrast-more:ring-dark',
                'contrast-more:text-dark',
                'contrast-more:dark:ring-light',
                'contrast-more:dark:text-light',

                'transition-all',
                'hover:shadow-md',
                'hover:scale-102',
                'hover:ring-dark/2',
                'hover:text-dark/10',
                'focus:shadow-md',
                'focus:scale-102',
                'focus:ring-dark/2',
                'focus:text-dark/10',
                'dark:hover:bg-dark-3',
                'dark:hover:ring-light/4',
                'dark:hover:text-light',
                'dark:focus:bg-dark-3',
                'dark:focus:ring-light/4',
                'dark:focus:text-light',

                'contrast-more:hover:ring-2',
                'contrast-more:hover:ring-dark',
                'dark:contrast-more:hover:ring-light',
                'contrast-more:focus:ring-2',
                'contrast-more:focus:ring-dark',
                'dark:contrast-more:focus:ring-light',

                'active:shadow-sm',
                'active:scale-98',

                'md:justify-start',
                'md:w-full',
                style,
            )}
        >
            <Icon
                icon="magnifying-glass"
                className={tcls('text-dark/8', 'dark:text-light/8', 'shrink-0', 'size-4')}
            />
            <div className={tcls('w-full', 'hidden', 'md:block', 'text-left')}>{children}</div>
            <Shortcut />
        </button>
    );
}

const Shortcut = () => {
    const [operatingSystem, setOperatingSystem] = useState('win');

    useEffect(() => {
        function getOperatingSystem() {
            const platform = navigator.platform.toLowerCase();

            if (platform.includes('mac')) return 'mac';
            if (platform.includes('win')) return 'win';

            return 'win';
        }

        setOperatingSystem(getOperatingSystem());
    }, []);

    return (
        <div
            className={tcls(
                'shortcut',
                'hidden',
                'md:inline',
                'justify-end',
                'text-xs',
                'text-dark/7',
                'contrast-more:text-dark',
                'dark:text-light-4/7',
                'contrast-more:dark:text-light',
                'whitespace-nowrap',
                `[font-feature-settings:"calt",_"case"]`,
            )}
        >
            {operatingSystem === 'mac' ? '⌘' : 'Ctrl +'} K
        </div>
    );
};
