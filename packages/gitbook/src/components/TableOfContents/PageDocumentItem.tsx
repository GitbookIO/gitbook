'use client';

import { tcls } from '@/lib/tailwind';
import { SiteInsightsLinkPosition } from '@gitbook/api';
import { OpenAPIMethodBadge } from '@gitbook/react-openapi';
import { Tag } from '../Tag';
import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';
import type { ClientTOCPageDocument } from './encodeClientTableOfContents';

export function PageDocumentItem(props: { page: ClientTOCPageDocument }) {
    const { page } = props;

    return (
        <li className="page-document-item flex flex-col [.page-group-item+&]:mt-4">
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
                icon={<TOCPageIcon page={page} />}
                tag={page.primaryTag ? <Tag tag={page.primaryTag} /> : null}
            >
                {page.openAPIOperation ? (
                    <span className="flex h-[1lh] shrink-0 items-center self-center">
                        <OpenAPIMethodBadge
                            method={page.openAPIOperation.method}
                            short
                            size="small"
                        />
                    </span>
                ) : null}
                <span className={page.openAPIOperation?.deprecated ? 'line-through' : undefined}>
                    {page.title}
                </span>
            </ToggleableLinkItem>
        </li>
    );
}
