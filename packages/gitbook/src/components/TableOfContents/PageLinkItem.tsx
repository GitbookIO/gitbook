import { type RevisionPageLink, SiteInsightsLinkPosition } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type { GitBookSiteContext } from '@v2/lib/context';

import { Link } from '@/components/primitives';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { TOCPageIcon } from './TOCPageIcon';

export async function PageLinkItem(props: { page: RevisionPageLink; context: GitBookSiteContext }) {
    const { page, context } = props;

    const resolved = await resolveContentRef(page.target, context);

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={resolved?.href ?? '#'}
                className={tcls(
                    'flex',
                    'justify-start',
                    'items-center',
                    'gap-3',
                    'p-1.5',
                    'pl-3',
                    'text-sm',
                    'transition-colors',
                    'duration-100',
                    'text-tint-strong/7',
                    'rounded-md',
                    'straight-corners:rounded-none',
                    'before:content-none',
                    'font-normal',
                    'hover:bg-tint',
                    'hover:text-tint-strong'
                )}
                insights={{
                    type: 'link_click',
                    link: {
                        target: page.target,
                        position: SiteInsightsLinkPosition.Sidebar,
                    },
                }}
            >
                <TOCPageIcon page={page} />
                {page.title}
                <Icon
                    icon="arrow-up-right-from-square"
                    className={tcls(
                        'size-3',
                        'mr-1',
                        'mt-1',
                        'place-self-start',
                        'shrink-0',
                        'text-current',
                        'transition-colors',
                        '[&>path]:transition-[opacity]',
                        '[&>path]:[opacity:0.40]',
                        'group-hover:[&>path]:[opacity:1]'
                    )}
                />
            </Link>
        </li>
    );
}
