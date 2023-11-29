'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { IconSearch } from '@/components/icons/IconSearch';
import { ClassValue, tcls } from '@/lib/tailwind';

import { useSearch } from './useSearch';

/**
 * Button to open the search modal.
 */
export function SearchButton(props: { children?: React.ReactNode; style?: ClassValue }) {
    const { style, children } = props;

    const [, setQuery] = useSearch();

    const onClick = () => {
        setQuery('');
    };

    return (
        <button
            onClick={onClick}
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
                'hover:bg-dark/3',
                'border',
                'border-dark/1',
                'dark:bg-light/1',
                'dark:border-light/1',
                'dark:hover:bg-light/2',
                '[&>span]:hidden',
                'sm:justify-between',
                'sm:[&>span]:flex',
                'sm:w-full',
                'sm:px-4',
                style,
            )}
        >
            {children}
            <IconSearch className={tcls('w-4', 'h-4')} />
        </button>
    );
}
