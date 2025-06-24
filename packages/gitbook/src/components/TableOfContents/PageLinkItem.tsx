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
                classNames={['PageLinkItemStyles']}
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
                        '[&>path]:transition-opacity',
                        '[&>path]:opacity-[0.4]',
                        'group-hover:[&>path]:opacity-11'
                    )}
                />
            </Link>
        </li>
    );
}
