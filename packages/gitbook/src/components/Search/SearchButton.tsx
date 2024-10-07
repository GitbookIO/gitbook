'use client';

import { Icon } from '@gitbook/icons';
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
                'px-2',
                'gap-3',
                'text-dark/7',
                'min-h-[2.5rem]',
                'w-[2.5rem]',
                'rounded-lg',
                'straight-corners:rounded-none',
                'bg-dark/2',
                'transition-colors',
                'transition-opacity',
                'ease-out',
                'hover:opacity-8',
                'ring-1',
                'ring-inset',
                'ring-dark/1',
                'dark:bg-light/1',
                'dark:ring-light/1',
                'dark:text-light/7',
                '[&>p]:hidden',
                '[&>span]:hidden',
                'md:justify-start',
                'md:[&>p]:flex',
                'md:[&>span]:flex',
                'md:w-full',
                'md:px-3.5',
                'text-base',
                style,
            )}
        >
            <div className={tcls('text-dark/7', 'pt-1.5', 'pb-2', 'dark:text-light/7')}>
                <Icon icon="magnifying-glass" className={tcls('shrink-0', 'size-4')} />
            </div>
            {children}
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
        <span
            className={tcls(
                'hidden',
                'md:inline',
                'justify-end',
                'text-xs',
                'text-dark/5',
                'dark:text-light/5',
                `[font-feature-settings:"calt",_"case"]`,
            )}
        >
            {operatingSystem === 'mac' ? '⌘' : 'Ctrl +'} K
        </span>
    );
};
