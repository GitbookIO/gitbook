'use client';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { useEffect, useState } from 'react';
import { streamPageTopics } from './server-actions/streamPageTopics';

/**
 * Show a list of recommended pages to read next.
 */
export function AIPageTopics(props: {
    spaceId: string;
    revisionId: string;
    pageId: string;
}) {
    const { spaceId, revisionId, pageId } = props;

    const [topics, setTopics] = useState<{ name?: string; icon?: string }[]>([]);

    useEffect(() => {
        let canceled = false;

        setTopics([]);

        (async () => {
            const stream = await streamPageTopics({
                spaceId,
                revisionId,
                pageId,
                previousPageIds: [],
            });

            for await (const topics of stream) {
                if (canceled) {
                    return;
                }

                setTopics(topics);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [spaceId, revisionId, pageId]);

    return (
        <div className={tcls('grid grid-flow-row grid-cols-2 gap-2')}>
            {topics.map((topic) => (
                <div
                    key={topic.name}
                    className='flex flex-col items-center justify-center gap-2 rounded-md border border-tint-subtle p-2 text-center transition-colors hover:cursor-pointer hover:bg-primary-subtle hover:text-primary'
                >
                    {topic.icon ? (
                        <Icon
                            icon={topic.icon as IconName}
                            className="size-4 text-primary-subtle"
                        />
                    ) : null}{' '}
                    {topic.name}
                </div>
            ))}
        </div>
    );
}
