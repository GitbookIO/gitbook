'use client';

import { Icon } from '@gitbook/icons';
import type { ClientTOCPageLink } from './encodeClientTableOfContents';

import { Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import { SiteInsightsLinkPosition } from '@gitbook/api';
import { TOCPageIcon } from './TOCPageIcon';

export function PageLinkItem(props: { page: ClientTOCPageLink }) {
    const { page } = props;

    const isExternal = page.target.kind === 'url';

    return (
        <li className={tcls('flex', 'flex-col')}>
            <Link
                href={page.href ?? '#'}
                classNames={['ToggleableLinkItemStyles']}
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
                {isExternal ? (
                    <Icon
                        icon="arrow-up-right"
                        className={tcls(
                            'size-3',
                            'ml-auto',
                            'mr-1',
                            'mt-1',
                            'place-self-start',
                            'shrink-0',
                            'text-current',
                            'transition-all',
                            'opacity-6',
                            'group-hover/toclink:opacity-11',
                            'contrast-more:opacity-11'
                        )}
                    />
                ) : null}
            </Link>
        </li>
    );
}
