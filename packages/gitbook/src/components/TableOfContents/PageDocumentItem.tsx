'use client';

import { tcls } from '@/lib/tailwind';
import type { ClientTOCPage } from './encodeClientTableOfContents';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export function PageDocumentItem(props: { page: ClientTOCPage }) {
    const { page } = props;

    return (
        <li className="flex flex-col">
            <ToggleableLinkItem
                href={page.href}
                pathnames={page.pathnames}
                insights={page.insights}
                descendants={
                    page.descendants && page.descendants.length > 0 ? (
                        <PagesList
                            pages={page.descendants}
                            style={tcls(
                                'ml-5',
                                'my-2',
                                'border-tint-subtle',
                                'sidebar-list-default:border-l',
                                'sidebar-list-line:border-l'
                            )}
                        />
                    ) : null
                }
            >
                {page.emoji || page.icon ? (
                    <span className="flex items-center gap-3">
                        <TOCPageIcon page={page} />
                        {page.title}
                    </span>
                ) : (
                    page.title
                )}
            </ToggleableLinkItem>
        </li>
    );
}
