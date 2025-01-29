'use client';

import { Icon } from '@gitbook/icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useLanguage, tString } from '@/intl/client';
import { ClassValue, tcls } from '@/lib/tailwind';

import { useSearch } from './useSearch';
import { useTrackEvent } from '../Insights';

/**
 * Button to open the search modal.
 */
export function SearchButton(props: { children?: React.ReactNode; style?: ClassValue }) {
    const { style, children } = props;

    const language = useLanguage();
    const [, setSearchState] = useSearch();
    const trackEvent = useTrackEvent();

    const onClick = () => {
        setSearchState({
            ask: false,
            global: false,
            query: '',
        });

        trackEvent({
            type: 'search_open',
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

                'bg-gray-base',

                'ring-1',
                'ring-gray-subtle',

                'shadow-sm',
                'shadow-gray-12/3',
                'dark:shadow-none',

                'text-gray',

                'rounded-lg',
                'straight-corners:rounded-sm',

                'contrast-more:ring-gray-12',
                'contrast-more:text-gray-strong',

                'transition-all',
                'hover:shadow-md',
                'hover:scale-102',
                'hover:ring-gray-hover',
                'hover:text-gray-strong',
                'focus:shadow-md',
                'focus:scale-102',
                'focus:ring-gray-hover',
                'focus:text-gray-strong',

                'contrast-more:hover:ring-2',
                'contrast-more:hover:ring-gray-12',
                'contrast-more:focus:ring-2',
                'contrast-more:focus:ring-gray-12',

                'active:shadow-sm',
                'active:scale-98',

                'md:justify-start',
                'md:w-full',
                style,
            )}
        >
            <Icon
                icon="magnifying-glass"
                className={tcls('text-gray-subtle', 'shrink-0', 'size-4')}
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
                'text-gray',
                'contrast-more:text-gray-strong',
                'whitespace-nowrap',
                `[font-feature-settings:"calt",_"case"]`,
            )}
        >
            {operatingSystem === 'mac' ? '⌘' : 'Ctrl +'} K
        </div>
    );
};
