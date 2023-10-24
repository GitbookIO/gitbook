'use client';

import { ClassValue, tcls } from '@/lib/tailwind';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Button to open the search modal.
 */
export function SearchButton(props: { style?: ClassValue }) {
    const { style } = props;

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
                'px-4',
                'py-2',
                'rounded',
                'bg-slate-100',
                'hover:bg-slate-200',
                'text-base',
                'text-slate-800',
                'hover:text-slate-900',
                'border',
                'border-slate-300',
                style,
            )}
        >
            Search
        </button>
    );
}
