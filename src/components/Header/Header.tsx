import { pageHref } from '@/lib/links';
import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import Link from 'next/link';
import { Suspense } from 'react';
import { SearchButton } from '../Search';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';

/**
 * Render the header for the space.
 */
export function Header(props: { space: Space; asFullWidth: boolean }) {
    const { space, asFullWidth } = props;

    return (
        <header
            className={tcls(
                'h-16',
                'sticky',
                'top-0',
                'z-10',
                'w-full',
                'backdrop-blur',
                'flex-none',
                'transition-colors',
                'duration-500',
                'lg:z-10',
                'lg:border-b',
                'lg:border-slate-900/10',
                'dark:border-slate-50/[0.06]',
                'bg-white/95',
                'supports-backdrop-blur:bg-white/60',
                'dark:bg-transparent',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    'items-center',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <Link href={pageHref('')} className={tcls('flex-1')}>
                    <h1 className={tcls('text-lg', 'text-slate-800', 'font-semibold')}>
                        {space.title}
                    </h1>
                </Link>
                <div>
                    <Suspense fallback={null}>
                        <SearchButton />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
