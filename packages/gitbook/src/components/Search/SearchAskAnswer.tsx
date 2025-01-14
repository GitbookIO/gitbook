'use client';

import { Icon } from '@gitbook/icons';
import React from 'react';

import { Loading } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { TranslationLanguage } from '@/intl/translations';
import { iterateStreamResponse } from '@/lib/actions';
import { SiteContentPointer } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { AskAnswerResult, AskAnswerSource, streamAskQuestion } from './server-actions';
import { useSearch, useSearchLink } from './useSearch';
import { useTrackEvent } from '../Insights';
import { Link } from '../primitives';
import { useSearchAskContext } from './SearchAskContext';

export type SearchAskState =
    | {
          type: 'answer';
          answer: AskAnswerResult;
      }
    | {
          type: 'error';
      }
    | {
          type: 'loading';
      };

/**
 * Fetch and render the answers to a question.
 */
export function SearchAskAnswer(props: { pointer: SiteContentPointer; query: string }) {
    const { pointer, query } = props;

    const language = useLanguage();
    const trackEvent = useTrackEvent();
    const [, setSearchState] = useSearch();
    const [askState, setAskState] = useSearchAskContext();
    const { organizationId, siteId, siteSpaceId } = pointer;

    React.useEffect(() => {
        let cancelled = false;

        setAskState({ type: 'loading' });

        (async () => {
            trackEvent({
                type: 'ask_question',
                query,
            });

            const response = streamAskQuestion(organizationId, siteId, siteSpaceId ?? null, query);
            const stream = iterateStreamResponse(response);

            // When we pass in "ask" mode, the query could still be updated by the client
            // we ensure that the query is up-to-date before starting the stream.
            setSearchState((prev) => (prev ? { ...prev, query, ask: true } : null));

            for await (const chunk of stream) {
                if (cancelled) {
                    return;
                }

                setAskState({ type: 'answer', answer: chunk });
            }
        })().catch(() => {
            if (cancelled) {
                return;
            }

            setAskState({ type: 'error' });
        });

        return () => {
            // During development, the useEffect is called twice and the second call doesn't process the stream,
            // causing the component to get stuck in the loading state.
            if (process.env.NODE_ENV !== 'development') {
                cancelled = true;
            }
        };
    }, [organizationId, siteId, siteSpaceId, query, setAskState, setSearchState, trackEvent]);

    React.useEffect(() => {
        return () => {
            setAskState(null);
        };
    }, [setAskState]);

    const loading = (
        <div className={tcls('w-full', 'flex', 'items-center', 'justify-center')}>
            <Loading className={tcls('w-6', 'py-8', 'text-primary')} />
        </div>
    );

    return (
        <div className={tcls('max-h-[60vh]', 'overflow-y-auto')}>
            {askState?.type === 'answer' ? (
                <React.Suspense fallback={loading}>
                    <TransitionAnswerBody answer={askState.answer} placeholder={loading} />
                </React.Suspense>
            ) : null}
            {askState?.type === 'error' ? (
                <div className={tcls('p-4')}>{t(language, 'search_ask_error')}</div>
            ) : null}
            {askState?.type === 'loading' ? loading : null}
        </div>
    );
}

/**
 * Since the answer can be an async component that could suspend rendering,
 * we need to wrap it in a transition to avoid flickering.
 */
function TransitionAnswerBody(props: { answer: AskAnswerResult; placeholder: React.ReactNode }) {
    const { answer, placeholder } = props;
    const [display, setDisplay] = React.useState<AskAnswerResult | null>(null);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        startTransition(() => {
            setDisplay(answer);
        });
    }, [answer]);

    return display ? (
        <div className={tcls('w-full')}>
            <AnswerBody answer={display} />
        </div>
    ) : (
        <>{placeholder}</>
    );
}

function AnswerBody(props: { answer: AskAnswerResult }) {
    const { answer } = props;
    const language = useLanguage();

    return (
        <>
            <div
                data-testid="search-ask-answer"
                className={tcls(
                    'my-4',
                    'sm:mt-6',
                    'px-4',
                    'sm:px-12',
                    'text-dark/9',
                    'dark:text-light/8',
                )}
            >
                {answer.body ?? t(language, 'search_ask_no_answer')}
                {answer.followupQuestions.length > 0 ? (
                    <AnswerFollowupQuestions followupQuestions={answer.followupQuestions} />
                ) : null}
            </div>
            {answer.sources.length > 0 ? (
                <AnswerSources
                    sources={answer.sources}
                    language={language}
                    hasAnswer={Boolean(answer.body)}
                />
            ) : null}
        </>
    );
}

function AnswerFollowupQuestions(props: { followupQuestions: string[] }) {
    const { followupQuestions } = props;
    const getSearchLinkProps = useSearchLink();

    return (
        <div className={tcls('flex', 'flex-col', 'flex-wrap', 'mt-4', 'sm:mt-6')}>
            {followupQuestions.map((question) => (
                <Link
                    key={question}
                    className={tcls(
                        'flex',
                        'items-center',
                        'gap-2',
                        'px-4',
                        '-mx-4',
                        'py-2',
                        'rounded',
                        'straight-corners:rounded-none',
                        'text-dark/7',
                        'dark:text-light/8',
                        'hover:bg-dark-4/2',
                        'dark:hover:bg-light-4/2',
                        'focus-within:bg-dark-4/2',
                        'dark:focus-within:bg-light-4/2',
                    )}
                    {...getSearchLinkProps({
                        query: question,
                        ask: true,
                    })}
                >
                    <Icon
                        icon="magnifying-glass"
                        className={tcls(
                            'size-4',
                            'shrink-0',
                            'mr-2',
                            'text-dark/5',
                            'dark:text-light/5',
                        )}
                    />
                    <span>{question}</span>
                </Link>
            ))}
        </div>
    );
}

function AnswerSources(props: {
    sources: AskAnswerSource[];
    language: TranslationLanguage;
    hasAnswer: boolean;
}) {
    const { sources, language, hasAnswer } = props;

    return (
        <div
            className={tcls(
                'flex',
                'flex-wrap',
                'gap-2',
                'mt-4',
                'sm:mt-6',
                'py-4',
                'px-4',
                'border-t',
                'border-dark/2',
                'dark:border-light/1',
            )}
        >
            <span>
                {t(language, hasAnswer ? 'search_ask_sources' : 'search_ask_sources_no_answer')}
            </span>

            {sources.map((source) => (
                <span key={source.id} className={tcls()}>
                    <Link
                        className={tcls(
                            'flex',
                            'flex-wrap',
                            'gap-1',
                            'items-center',
                            'text-dark/7',
                            'hover:underline',
                            'focus-within:text-primary-700',
                            'dark:text-light/8',
                        )}
                        href={source.href}
                        prefetch={false}
                    >
                        <Icon
                            icon="arrow-up-right"
                            className={tcls(
                                'text-dark/6',
                                'size-4',
                                'shrink-0',
                                'dark:text-light/6',
                            )}
                        />
                        {source.title}
                    </Link>
                </span>
            ))}
        </div>
    );
}
