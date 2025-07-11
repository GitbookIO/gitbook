'use client';

import { Icon } from '@gitbook/icons';

import { tString, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';
import { useTrackEvent } from '../Insights';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
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
                'py-2.5',
                'md:py-2',
                'px-3',
                'circular-corners:px-4',
                'gap-2',

                'bg-tint-base',

                'ring-1',
                'ring-tint-12/2',
                'depth-flat:ring-tint-subtle',

                'shadow-sm',
                'shadow-tint-12/3',
                'dark:shadow-none',
                'depth-flat:shadow-none',

                'text-tint',

                'rounded-lg',
                'straight-corners:rounded-sm',
                'circular-corners:rounded-full',

                'contrast-more:ring-tint-12',
                'contrast-more:text-tint-strong',

                'transition-all',
                'hover:bg-tint-subtle',
                'hover:shadow-md',
                'hover:scale-102',
                'depth-flat:hover:scale-100',
                'hover:ring-tint-hover',
                'hover:text-tint-strong',
                'focus:shadow-md',
                'focus:scale-102',
                'depth-flat:focus:scale-100',
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
            <KeyboardShortcut
                keys={['mod', 'k']}
                className="theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background"
            />
        </button>
    );
}
