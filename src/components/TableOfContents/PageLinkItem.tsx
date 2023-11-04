import { RevisionPageLink } from '@gitbook/api';
import { tcls } from '@/lib/tailwind';
import Link from 'next/link';

export function PageLinkItem(props: {
    page: RevisionPageLink;
}) {
    const { page } = props;

    return (
        <li className={tcls('flex', 'flex-col', 'mb-0.5')}>
            <Link href={
                page.href ?? '#todo' // TODO: Will be fixed soon as the `target`
            }
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
                'hover:bg-slate-100', 'text-slate-500', 'font-normal',
            )}
            >{page.title}</Link>
        </li>
    );
}
