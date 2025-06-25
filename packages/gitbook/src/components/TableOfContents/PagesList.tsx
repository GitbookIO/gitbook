'use client';

import type { ClientTOCPage } from './encodeClientTableOfContents';

import { type ClassValue, tcls } from '@/lib/tailwind';

import assertNever from 'assert-never';
import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';
import { PageLinkItem } from './PageLinkItem';

export function PagesList(props: { pages: ClientTOCPage[]; style?: ClassValue }) {
    const { pages, style } = props;

    return (
        <ul className={tcls('flex flex-col gap-y-0.5', style)}>
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
