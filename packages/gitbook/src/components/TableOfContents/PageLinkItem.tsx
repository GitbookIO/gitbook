'use client';

import { SiteInsightsLinkPosition } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { useCurrentPagePath, useHash } from '../hooks';
import type { ClientTOCPageLink } from './encodeClientTableOfContents';
import { TOCPageIcon } from './TOCPageIcon';
import { Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

export function PageLinkItem(props: { page: ClientTOCPageLink }) {
    const { page } = props;

    const isExternal = page.target.kind === 'url';

    const currentPagePath = useCurrentPagePath();
    const hash = useHash();
    const isOnTargetPage =
        page.pathnames?.some((pathname) => pathname === currentPagePath) ?? false;
    // A link to a section only lights up once the reader is at that section, so sibling links
    // pointing at other sections of the same page don't all highlight together.
    const isActive = isOnTargetPage && (!page.anchor || page.anchor === hash);

    return (
        <li className="page-link-item flex flex-col [.page-group-item+&]:mt-4">
            <Link
                href={page.href ?? '#'}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                classNames={[
                    'ToCLinkItemStyles',
                    ...(isActive ? ['ToCLinkItemActiveStyles' as const] : []),
                ]}
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
