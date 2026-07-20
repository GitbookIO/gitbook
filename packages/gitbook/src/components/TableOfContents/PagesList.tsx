'use client';

import type { ClientTOCPage } from './encodeClientTableOfContents';

import { type ClassValue, tcls } from '@/lib/tailwind';

import assertNever from 'assert-never';
import { markSpaceNavigationFromTOCLinkOnClick } from '../hooks';
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
        <ul
            className={tcls('flex flex-col gap-y-0.5', style)}
            // Flag navigations that start from a ToC link so the destination can offer a
            // "Back to space" shortcut for cross-space links. Only needed on the root
            // list: capture catches clicks on nested items too.
            onClickCapture={isRoot ? markSpaceNavigationFromTOCLinkOnClick : undefined}
        >
            {pages.map((page, idx) => {
                switch (page.type) {
                    case 'document':
                        return <PageDocumentItem key={page.id} page={page} />;

                    case 'link':
                        return <PageLinkItem key={page.id} page={page} />;

                    case 'group':
                        return (
                            <PageGroupItem
                                key={page.id}
                                page={page}
                                isFirst={isRoot && idx === 0}
                            />
                        );

                    default:
                        assertNever(page);
                }
            })}
        </ul>
    );
}
