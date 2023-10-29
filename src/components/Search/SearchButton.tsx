'use client';

import { ClassValue, tcls } from '@/lib/tailwind';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { IconSearch } from '@/components/icons/IconSearch';

/**
 * Button to open the search modal.
 */
export function SearchButton(props: { children: React.ReactNode; style?: ClassValue }) {
    const { style, children } = props;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onClick = () => {
        const params = new URLSearchParams(searchParams);
        params.set('q', '');
        router.push(pathname + '?' + params.toString());
    };

    return (
        <button
            onClick={onClick}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'px-4',
                'py-2',
                'rounded',
                'bg-slate-50',
                'hover:bg-slate-100',
                'text-base',
                'text-slate-800',
                'hover:text-slate-900',
                'border',
                'border-slate-200',
                style,
            )}
        >
            <IconSearch className={tcls('w-4', 'h-4', 'me-2')} />
            {children}
        </button>
    );
}
