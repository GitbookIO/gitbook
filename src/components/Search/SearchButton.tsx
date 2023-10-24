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
        <button onClick={onClick} className={tcls(style)}>
            Search
        </button>
    );
}
