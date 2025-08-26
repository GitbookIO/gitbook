'use client';

import { Icon } from '@gitbook/icons';
import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { Loading } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations';
import { tcls } from '@/lib/tailwind';

import { AIResponseFeedback } from '../AIChat';
import { useTrackEvent } from '../Insights';
import { Link } from '../primitives';
import { useSearchAskContext } from './SearchAskContext';
import { type AskAnswerResult, type AskAnswerSource, streamAskQuestion } from './server-actions';
import { useSearchLink } from './useSearch';

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
export function SearchAskAnswer(props: { query: string }) {
    const { query } = props;

    const language = useLanguage();
    const trackEvent = useTrackEvent();
    const [askState, setAskState] = useSearchAskContext();

    React.useEffect(() => {
        let cancelled = false;

        setAskState({ type: 'loading' });

        (async () => {
            trackEvent({
                type: 'ask_question',
                query,
            });

            const { stream } = await streamAskQuestion({ question: query });
            for await (const chunk of readStreamableValue(stream)) {
                if (cancelled) {
                    return;
                }

                if (chunk) {
                    setAskState({ type: 'answer', answer: chunk });
                }
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
    }, [query, setAskState, trackEvent]);

    React.useEffect(() => {
        return () => {
            setAskState(null);
        };
    }, [setAskState]);

    const loading = (
        <div className="flex grow items-center justify-center">
            <Loading className={tcls('size-6', 'text-tint/6')} />
        </div>
    );

    return (
        <div className="flex min-h-full p-4">
            {askState?.type === 'answer' ? (
                <React.Suspense fallback={loading}>
                    <TransitionAnswerBody
                        answer={askState.answer}
                        placeholder={loading}
                        query={query}
                    />
                </React.Suspense>
            ) : null}
            {askState?.type === 'error' ? (
                <div className={tcls('grow p-4 text-center')}>
                    {t(language, 'search_ask_error')}
                </div>
            ) : null}
            {askState?.type === 'loading' ? loading : null}
        </div>
    );
}

/**
 * Since the answer can be an async component that could suspend rendering,
 * we need to wrap it in a transition to avoid flickering.
 */
function TransitionAnswerBody(props: {
    query: string;
    answer: AskAnswerResult;
    placeholder: React.ReactNode;
}) {
    const { query, answer, placeholder } = props;
    const [display, setDisplay] = React.useState<AskAnswerResult | null>(null);
    const [_isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        startTransition(() => {
            setDisplay(answer);
        });
    }, [answer]);

    return display ? (
        <div className={tcls('w-full')}>
            <AnswerBody query={query} answer={display} />
        </div>
    ) : (
        <>{placeholder}</>
    );
}

function AnswerBody(props: { query: string; answer: AskAnswerResult }) {
    const { query, answer } = props;
    const language = useLanguage();

    return (
        <>
            <div data-testid="search-ask-answer" className="text-tint-strong">
                {answer.body ?? t(language, 'search_ask_no_answer')}
                {answer.sources.length > 0 ? (
                    // @TODO: Add responseId once search uses new AI endpoint
                    <AIResponseFeedback query={query} className="-ml-1 mt-2" responseId="" />
                ) : null}
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
        <div className={tcls('flex', 'flex-col', 'flex-wrap', 'mt-4')}>
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
                        'rounded-sm',
                        'straight-corners:rounded-none',
                        'circular-corners:rounded-full',
                        'text-tint',
                        'hover:bg-tint-hover',
                        'focus-within:bg-tint-hover'
                    )}
                    {...getSearchLinkProps({
                        ask: question,
                        open: true,
                    })}
                >
                    <Icon
                        icon="magnifying-glass"
                        className={tcls('size-4', 'shrink-0', 'mr-2', 'text-tint-subtle')}
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
                'pt-4',
                'border-t',
                'border-subtle'
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
                            'text-tint',
                            'hover:underline',
                            'links-accent:decoration-[3px]',
                            'links-accent:underline-offset-4',
                            'focus-within:text-primary'
                        )}
                        href={source.href}
                    >
                        <Icon
                            icon="arrow-up-right"
                            className={tcls('text-tint-subtle', 'size-4', 'shrink-0')}
                        />
                        {source.title}
                    </Link>
                </span>
            ))}
        </div>
    );
}
