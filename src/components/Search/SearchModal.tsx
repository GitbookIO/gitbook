'use client';

import { tcls } from '@/lib/tailwind';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function SearchModal(props: {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    if (query === null) {
        return null;
    }

    const onUpdateQuery = (newQuery: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('q', newQuery);
        router.push(pathname + '?' + params.toString());
    };

    const onClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('q');
        router.push(pathname);
    };

    return (
        <div
            className={tcls(
                'fixed',
                'inset-0',
                'bg-zinc-400/25',
                'backdrop-blur-sm',
                'dark:bg-black/40',
                'opacity-100',
                'z-30',
            )}
            onClick={onClose}
        >
            <div role="dialog">
                <div />
            </div>
        </div>
    );
}
