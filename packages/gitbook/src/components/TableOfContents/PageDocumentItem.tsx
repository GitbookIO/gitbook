'use client';

import { SiteInsightsLinkPosition } from '@gitbook/api';
import { OpenAPIMethodBadge } from '@gitbook/react-openapi';

import { Tag } from '../Tag';
import type { ClientTOCPageDocument } from './encodeClientTableOfContents';
import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export function PageDocumentItem(props: { page: ClientTOCPageDocument }) {
    const { page } = props;

    return (
        <li className="page-document-item">
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
                        <PagesList pages={page.descendants} style="toc-list-nested" />
                    ) : null
                }
                icon={<TOCPageIcon page={page} />}
                tag={page.primaryTag ? <Tag tag={page.primaryTag} /> : null}
            >
                {page.openAPIOperation ? (
                    <span className="toclink-method">
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
