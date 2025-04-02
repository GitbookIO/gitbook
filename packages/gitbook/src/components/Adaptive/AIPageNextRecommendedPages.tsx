'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
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

    const [pages, setPages] = useState<{ title: string; href: string; icon?: string }[]>([]);

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
        <div className={tcls('flex flex-col gap-2')}>
            {pages.map((page) => {
                return (
                    <Link className='flex items-center gap-3' key={page.href} href={page.href}>
                        <Icon className="size-4" icon={page.icon} />
                        {page.title}
                    </Link>
                );
            })}
        </div>
    );
}
