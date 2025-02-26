'use client';

import { PageFeedbackRating } from '@gitbook/api';
import React, { type ButtonHTMLAttributes } from 'react';

import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';

import { useTrackEvent } from '../Insights';
import { Button } from '../primitives';

const MAX_COMMENT_LENGTH = 512;

/**
 * Form to submit feedback on a page.
 */
export function PageFeedbackForm(props: {
    pageId: string;
    className?: string;
}) {
    const { className } = props;
    const languages = useLanguage();
    const trackEvent = useTrackEvent();
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const [rating, setRating] = React.useState<PageFeedbackRating>();
    const [comment, setComment] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);

    const onSubmitRating = (rating: PageFeedbackRating) => {
        setRating(rating);

        trackEvent({
            type: 'page_post_feedback',
            feedback: {
                rating,
            },
        });
    };

    const onSubmitComment = (rating: PageFeedbackRating, comment: string) => {
        setSubmitted(true);

        trackEvent({
            type: 'page_post_feedback_comment',
            feedback: {
                rating,
                comment,
            },
        });
    };

    // Focus the comment input when the rating is submitted
    React.useEffect(() => {
        if (rating) {
            inputRef.current?.focus();
        }
    }, [rating]);

    return (
        <div className={tcls('flex flex-col gap-3 text-sm', className)}>
            <div className="flex flex-wrap items-center gap-2">
                <p>{t(languages, 'was_this_helpful')}</p>
                <div className="rounded-full border border-tint-subtle bg-tint-base contrast-more:border-tint-12">
                    <div className="flex">
                        <RatingButton
                            rating={PageFeedbackRating.Bad}
                            label={tString(languages, 'was_this_helpful_negative')}
                            onClick={() => onSubmitRating(PageFeedbackRating.Bad)}
                            active={rating === PageFeedbackRating.Bad}
                            disabled={rating !== undefined}
                        />
                        <RatingButton
                            rating={PageFeedbackRating.Ok}
                            label={tString(languages, 'was_this_helpful_neutral')}
                            onClick={() => onSubmitRating(PageFeedbackRating.Ok)}
                            active={rating === PageFeedbackRating.Ok}
                            disabled={rating !== undefined}
                        />
                        <RatingButton
                            rating={PageFeedbackRating.Good}
                            label={tString(languages, 'was_this_helpful_positive')}
                            onClick={() => onSubmitRating(PageFeedbackRating.Good)}
                            active={rating === PageFeedbackRating.Good}
                            disabled={rating !== undefined}
                        />
                    </div>
                </div>
            </div>
            {rating ? (
                <div className="flex flex-col gap-2">
                    {!submitted ? (
                        <>
                            <textarea
                                ref={inputRef}
                                name="comment"
                                className="max-h-40 min-h-16 grow rounded straight-corners:rounded-none bg-tint-base p-2 ring-1 ring-tint ring-inset placeholder:text-sm placeholder:text-tint contrast-more:ring-tint-12 contrast-more:placeholder:text-tint-strong"
                                placeholder={tString(languages, 'was_this_helpful_comment')}
                                aria-label={tString(languages, 'was_this_helpful_comment')}
                                onChange={(e) => setComment(e.target.value)}
                                value={comment}
                                rows={3}
                                maxLength={MAX_COMMENT_LENGTH}
                            />
                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    size="small"
                                    onClick={() => onSubmitComment(rating, comment)}
                                >
                                    {t(languages, 'submit')}
                                </Button>
                                {comment.length > MAX_COMMENT_LENGTH * 0.8 ? (
                                    <span
                                        className={
                                            comment.length === MAX_COMMENT_LENGTH
                                                ? 'text-red-500'
                                                : ''
                                        }
                                    >
                                        {comment.length} / {MAX_COMMENT_LENGTH}
                                    </span>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <p>{t(languages, 'was_this_helpful_thank_you')}</p>
                    )}
                </div>
            ) : null}
        </div>
    );
}

function RatingButton(
    props: {
        rating: PageFeedbackRating;
        label: string;
        onClick: () => void;
        active: boolean;
    } & ButtonHTMLAttributes<HTMLButtonElement>
) {
    const { rating, label, onClick, active, ...attr } = props;

    const ratingIcon =
        {
            bad: <IconBad />,
            ok: <IconOk />,
            good: <IconGood />,
        }[rating] ?? null;

    return (
        <button
            className={tcls(
                'p-2 first:rounded-l-full first:pl-2.5 last:rounded-r-full last:pr-2.5 hover:bg-primary-hover hover:text-primary-strong',
                'disabled:cursor-not-allowed disabled:hover:bg-inherit disabled:hover:text-inherit disabled:dark:hover:text-inherit',
                'ring-tint contrast-more:hover:ring-1',
                active
                    ? 'bg-primary-active text-primary-strong disabled:hover:bg-primary-active disabled:hover:text-primary-strong contrast-more:ring-2 contrast-more:hover:ring-2'
                    : 'disabled:opacity-7 disabled:contrast-more:ring-0'
            )}
            type="button"
            {...attr}
            aria-label={label}
            title={label}
            onClick={onClick}
        >
            {ratingIcon}
        </button>
    );
}

const IconBad = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.66782 13.3737C4.87421 13.5572 5.19025 13.5386 5.3737 13.3322C7.30371 11.1609 10.6963 11.1609 12.6263 13.3322C12.8098 13.5386 13.1258 13.5572 13.3322 13.3737C13.5386 13.1902 13.5572 12.8742 13.3737 12.6678C11.0459 10.049 6.9541 10.049 4.6263 12.6678C4.44284 12.8742 4.46143 13.1902 4.66782 13.3737ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
const IconOk = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.5 12C4.5 11.7239 4.72386 11.5 5 11.5H13C13.2761 11.5 13.5 11.7239 13.5 12C13.5 12.2761 13.2761 12.5 13 12.5H5C4.72386 12.5 4.5 12.2761 4.5 12ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
const IconGood = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.66782 11.6263C4.87421 11.4428 5.19025 11.4614 5.3737 11.6678C7.30371 13.8391 10.6963 13.8391 12.6263 11.6678C12.8098 11.4614 13.1258 11.4428 13.3322 11.6263C13.5386 11.8098 13.5572 12.1258 13.3737 12.3322C11.0459 14.951 6.9541 14.951 4.6263 12.3322C4.44284 12.1258 4.46143 11.8098 4.66782 11.6263ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
