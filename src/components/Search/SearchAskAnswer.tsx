import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { AskAnswerResult, askQuestion } from './server-actions';
import { useSearch, useSearchLink } from './useSearch';

/**
 * Fetch and render the answers to a question.
 */
export function SearchAskAnswer(props: { spaceId: string; query: string }) {
    const { spaceId, query } = props;

    const [state, setState] = React.useState<
        | {
              type: 'answer';
              answer: AskAnswerResult | null;
          }
        | {
              type: 'error';
          }
        | null
    >(null);

    React.useEffect(() => {
        setState(null);

        askQuestion(spaceId, query).then(
            (answer) => {
                setState({
                    type: 'answer',
                    answer,
                });
            },
            (error) => {
                setState({
                    type: 'error',
                });
            },
        );
    }, [spaceId, query]);

    return (
        <div className={tcls('p-4')}>
            {state?.type === 'answer' ? (
                <div>{state.answer ? <AnswerBody answer={state.answer} /> : 'No answer'}</div>
            ) : null}
            {state?.type === 'error' ? <div>Failed to fetch answer</div> : null}
            {!state ? <div>Loading...</div> : null}
        </div>
    );
}

function AnswerBody(props: { answer: AskAnswerResult }) {
    const { answer } = props;
    const getSearchLinkProps = useSearchLink();

    return (
        <div>
            <div>{answer.body}</div>
            {answer.followupQuestions.length > 0 ? (
                <div className={tcls('mt-4')}>
                    {answer.followupQuestions.map((question) => (
                        <Link
                            key={question}
                            className={tcls(
                                'me-2',
                                'mt-2',
                                'text-primary-500',
                                'underline',
                                'focus-within:text-primary-700',
                            )}
                            {...getSearchLinkProps({
                                query: question,
                                ask: true,
                            })}
                        >
                            {question}
                        </Link>
                    ))}
                </div>
            ) : null}
            {answer.sources.length > 0 ? (
                <div className={tcls('mt-5')}>
                    <p className={tcls('text-base')}>Sources</p>
                    <div className={tcls('mt-3')}>
                        {answer.sources.map((source) => (
                            <Link
                                key={source.id}
                                className={tcls(
                                    'me-2',
                                    'mt-2',
                                    'text-primary-500',
                                    'underline',
                                    'focus-within:text-primary-700',
                                )}
                                href={source.href}
                                prefetch={false}
                            >
                                {source.title}
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
