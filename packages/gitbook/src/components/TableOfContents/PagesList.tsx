'use client';

import type { ClientTOCPage } from './encodeClientTableOfContents';

import { type ClassValue, tcls } from '@/lib/tailwind';

import assertNever from 'assert-never';
import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';
import { PageLinkItem } from './PageLinkItem';

export function PagesList(props: {
    pages: ClientTOCPage[];
    style?: ClassValue;
    isRoot?: boolean;
}) {
    const { pages, style, isRoot = false } = props;

    return (
        <ul className={tcls('flex flex-col gap-y-0.5', isRoot && 'group/root-page-list', style)}>
            {pages.map((page) => {
                switch (page.type) {
                    case 'document':
                        return <PageDocumentItem key={page.id} page={page} />;

                    case 'link':
                        return <PageLinkItem key={page.id} page={page} />;

                    case 'group':
                        return <PageGroupItem key={page.id} page={page} />;

                    default:
                        assertNever(page);
                }
            })}
        </ul>
    );
}
