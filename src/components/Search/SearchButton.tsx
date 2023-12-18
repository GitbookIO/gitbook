'use client';

import { IconSearch } from '@/components/icons/IconSearch';
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
                'min-h-[2.5rem]',
                'w-[2.5rem]',
                'rounded-lg',
                'bg-dark/2',
                'transition-colors',
                'ease-out',
                'hover:bg-dark/3',
                'border',
                'border-dark/1',
                'dark:bg-light/1',
                'dark:border-light/1',
                'dark:hover:bg-light/2',
                '[&>span]:hidden',
                'md:justify-between',
                'md:[&>span]:flex',
                'md:w-full',
                'md:px-4',
                style,
            )}
        >
            {children}
            <IconSearch className={tcls('w-4', 'h-4')} />
        </button>
    );
}
