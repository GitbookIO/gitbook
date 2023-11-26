import { RevisionPageLink } from '@gitbook/api';
import Link from 'next/link';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

export async function PageLinkItem(props: { page: RevisionPageLink; context: ContentRefContext }) {
    const { page, context } = props;

    const resolved = await resolveContentRef(page.target, context);

    return (
        <li className={tcls('flex', 'flex-col', 'mb-0.5')}>
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
                    'hover:bg-slate-100',
                    'text-slate-500',
                    'font-normal',
                )}
            >
                {page.title}
            </Link>
        </li>
    );
}
