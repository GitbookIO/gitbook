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
                'items-center',
                'px-4',
                'py-1',
                'rounded',
                'dark:bg-vanta/4',
                'hover:bg-light',
                'border',
                'border-dark/2',
                'shadow-lg',
                'dark:border-light/3',
                style,
            )}
        >
            <IconSearch className={tcls('w-4', 'h-4', children ? 'me-2' : null)} />
            {children}
        </button>
    );
}
