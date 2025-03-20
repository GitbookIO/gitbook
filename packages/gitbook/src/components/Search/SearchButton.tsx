'use client';

import { Icon } from '@gitbook/icons';
import { useEffect, useState } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { useTrackEvent } from '../Insights';
import { useSearch } from './useSearch';

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
            type="button"
            onClick={onClick}
            aria-label={tString(language, 'search')}
            className={tcls(
                'flex',
                'flex-1',
                'flex-row',
                'justify-center',
                'items-center',
                'w-full',
                'py-2',
                'px-3',
                'gap-2',

                'bg-tint-base',

                'ring-1',
                'ring-tint-12/2',

                'shadow-sm',
                'shadow-tint-12/3',
                'dark:shadow-none',

                'text-tint',

                'rounded-lg',
                'straight-corners:rounded-sm',

                'contrast-more:ring-tint-12',
                'contrast-more:text-tint-strong',

                'transition-all',
                'hover:bg-tint-subtle',
                'hover:shadow-md',
                'hover:scale-102',
                'hover:ring-tint-hover',
                'hover:text-tint-strong',
                'focus:shadow-md',
                'focus:scale-102',
                'focus:ring-tint-hover',
                'focus:text-tint-strong',

                'contrast-more:hover:ring-2',
                'contrast-more:hover:ring-tint-12',
                'contrast-more:focus:ring-2',
                'contrast-more:focus:ring-tint-12',

                'active:shadow-sm',
                'active:scale-100',

                'md:justify-start',
                'md:w-full',
                'text-sm',
                style
            )}
        >
            <Icon
                icon="magnifying-glass"
                className={tcls('text-tint-subtle', 'shrink-0', 'size-4')}
            />
            <div className={tcls('w-full', 'hidden', 'md:block', 'text-left')}>{children}</div>
            <Shortcut />
        </button>
    );
}

function Shortcut() {
    const [operatingSystem, setOperatingSystem] = useState<string | null>(null);

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
            aria-busy={operatingSystem === null ? 'true' : undefined}
            className={tcls(
                `shortcut -mr-1 hidden justify-end gap-0.5 whitespace-nowrap text-tint text-xs [font-feature-settings:"calt",_"case"] contrast-more:text-tint-strong md:flex`,
                operatingSystem
                    ? 'motion-safe:animate-fadeIn motion-reduce:opacity-100'
                    : 'opacity-0'
            )}
        >
            <kbd
                className={`flex h-5 min-w-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1 ${operatingSystem === 'mac' ? 'text-sm' : ''}`}
            >
                {operatingSystem === 'mac' ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="flex size-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background">
                K
            </kbd>
        </div>
    );
}
