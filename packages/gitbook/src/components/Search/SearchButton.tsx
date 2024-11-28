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
        <motion.button
            layout="position"
            layoutId="searchbox"
            transition={{
                layout: {
                    type: 'spring',
                    bounce: 0,
                    duration: 0.2,
                },
            }}
            whileHover={{
                scale: 1.02,
            }}
            whileTap={{
                scale: 0.98,
            }}
            onClick={onClick}
            aria-label={tString(language, 'search')}
            className={tcls(
                'flex',
                'flex-1',
                'flex-row',
                'justify-center',
                'items-center',
                'w-full',
                'p-2',
                'gap-2',

                'bg-light',
                'dark:bg-dark',

                'ring-1',
                'ring-dark/1',
                'dark:ring-light/2',

                'shadow',
                'dark:shadow-none',

                'text-dark/6',
                'dark:text-light/6',

                'rounded-lg',
                'straight-corners:rounded-none',

                'contrast-more:ring-dark',
                'contrast-more:text-dark',
                'contrast-more:dark:ring-light',
                'contrast-more:dark:text-light',

                'transition-[box-shadow,color,background-color]',
                'hover:shadow-md',
                'dark:hover:bg-light/1',
                'hover:ring-dark/2',
                'hover:text-dark/8',
                'dark:hover:ring-light/4',
                'dark:hover:text-light/8',

                'active:shadow-sm',

                // '[&>p]:hidden',
                // '[&>span]:hidden',
                'md:justify-start',
                'flex',
                // 'md:[&>p]:flex',
                // 'md:[&>span]:flex',
                'md:w-full',
                style,
            )}
        >
            <Icon icon="magnifying-glass" className={tcls('text-dark/8', 'dark:text-light/8', 'shrink-0', 'size-4')} />
            <div className={tcls('w-full', 'hidden', 'md:block', 'text-left')}>
                {children}
            </div>
            <Shortcut />
        </motion.button>
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
                'hidden',
                'md:inline',
                'justify-end',
                'text-xs',
                'text-dark/5',
                'contrast-more:text-dark',
                'dark:text-light/5',
                'whitespace-nowrap',
                'contrast-more:dark:text-light',
                `[font-feature-settings:"calt",_"case"]`,
            )}
        >
            {operatingSystem === 'mac' ? '⌘' : 'Ctrl +'} K
        </div>
    );
};
