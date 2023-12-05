import { RevisionPageLink } from '@gitbook/api';
import Link from 'next/link';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

export async function PageLinkItem(props: { page: RevisionPageLink; context: ContentRefContext }) {
    const { page, context } = props;

    const resolved = await resolveContentRef(page.target, context);

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={resolved?.href ?? '#'}
                className={tcls(
                    'flex',
                    'flex-row',
                    'justify-between',
                    'rounded',
                    'px-2',
                    'py-1.5',
                    'text-sm',
                    'transition-colors',
                    'duration-100',
                    'text-primary',
                    'font-normal',
                    'hover:bg-dark/2',
                    'hover:text-current',
                    'dark:hover:bg-primary-500/2',
                    'dark:hover:text-primary-400',
                )}
            >
                {page.title}
            </Link>
        </li>
    );
}
