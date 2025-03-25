'use client';

import { tcls } from '@/lib/tailwind';
import { useEffect, useState } from 'react';
import { Link } from '../primitives';
import { streamPageRecommendedQuestions } from './server-actions';

/**
 * Show a list of recommended questions for a page.
 */
export function AIPageRecommendedQuestions(props: {
    spaceId: string;
    revisionId: string;
    pageId: string;
}) {
    const { spaceId, revisionId, pageId } = props;

    const [questions, setQuestions] = useState<string[]>([]);

    useEffect(() => {
        let canceled = false;

        setQuestions([]);

        (async () => {
            const stream = await streamPageRecommendedQuestions({ spaceId, revisionId, pageId });

            console.log('streaming', stream);

            for await (const question of stream) {
                if (canceled) {
                    return;
                }

                setQuestions((questions) => [...questions, question]);
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
            {questions.map((question) => {
                const urlParams = new URLSearchParams();
                urlParams.set('q', question);
                urlParams.set('ask', 'true');

                return (
                    <Link key={question} href={`?${urlParams.toString()}`}>
                        {question}
                    </Link>
                );
            })}
        </div>
    );
}
