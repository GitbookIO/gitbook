'use client';

import { Icon } from '@gitbook/icons';
import type { ClientTOCPageLink } from './encodeClientTableOfContents';

import { Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import { SiteInsightsLinkPosition } from '@gitbook/api';
import { TOCPageIcon } from './TOCPageIcon';

export function PageLinkItem(props: { page: ClientTOCPageLink }) {
    const { page } = props;

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={page.href ?? '#'}
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
