'use client';

import { tcls } from '@/lib/tailwind';
import { useEffect, useState } from 'react';
import { Link } from '../primitives';
import { streamNextRecommendedPages } from './server-actions';

/**
 * Show a list of recommended pages to read next.
 */
export function AIPageNextRecommendedPages(props: {
    spaceId: string;
    revisionId: string;
    pageId: string;
}) {
    const { spaceId, revisionId, pageId } = props;

    const [pages, setPages] = useState<{ title: string; href: string }[]>([]);

    useEffect(() => {
        let canceled = false;

        setPages([]);

        (async () => {
            const stream = await streamNextRecommendedPages({
                spaceId,
                revisionId,
                pageId,
                previousPageIds: [],
            });

            for await (const page of stream) {
                if (canceled) {
                    return;
                }

                setPages((pages) => [...pages, page]);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [spaceId, revisionId, pageId]);

    return (
        <div
            className={tcls(
                'flex flex-row flex-wrap gap-2',
                'max-w-3xl',
                'mx-auto',
                'page-api-block:ml-0'
            )}
        >
            {pages.map((page) => {
                return (
                    <Link key={page.href} href={page.href}>
                        {page.title}
                    </Link>
                );
            })}
        </div>
    );
}
