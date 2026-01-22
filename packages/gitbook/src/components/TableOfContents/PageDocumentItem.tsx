'use client';

import { tcls } from '@/lib/tailwind';
import type { ClientTOCPageDocument } from './encodeClientTableOfContents';

import { SiteInsightsLinkPosition } from '@gitbook/api';
import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export function PageDocumentItem(props: { page: ClientTOCPageDocument }) {
    const { page } = props;

    return (
        <li className="flex flex-col">
            <ToggleableLinkItem
                href={page.href ?? '#'}
                pathnames={page.pathnames}
                insights={{
                    type: 'link_click',
                    link: {
                        target: { kind: 'page', page: page.id },
                        position: SiteInsightsLinkPosition.Sidebar,
                    },
                }}
                descendants={
                    page.descendants && page.descendants.length > 0 ? (
                        <PagesList
                            pages={page.descendants}
                            style={tcls(
                                'ml-5',
                                'my-2',
                                'border-tint-subtle',
                                'sidebar-list-default:border-l',
                                'sidebar-list-line:border-l',
                                'break-anywhere'
                            )}
                        />
                    ) : null
                }
            >
                <TOCPageIcon page={page} />
                {page.title}
            </ToggleableLinkItem>
        </li>
    );
}
