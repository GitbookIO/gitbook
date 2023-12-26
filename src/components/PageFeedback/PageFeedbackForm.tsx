'use client';

import { PageFeedbackRating } from '@gitbook/api';
import React from 'react';

import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { getVisitorId } from '@/lib/analytics';
import { tcls } from '@/lib/tailwind';

import { postPageFeedback } from './server-actions';

/**
 * Form to submit feedback on a page.
 */
export function PageFeedbackForm(props: { spaceId: string; pageId: string }) {
    const { spaceId, pageId } = props;
    const languages = useLanguage();
    const [submitted, setSubmitted] = React.useState(false);

    const onSubmit = async (rating: PageFeedbackRating) => {
        setSubmitted(true);
        const visitorId = await getVisitorId();
        await postPageFeedback({ spaceId, pageId, visitorId, rating });
    };

    return (
        <div className={tcls('mt-2')}>
            <p className={tcls('text-sm', 'text-dark/6', 'dark:text-light/5')}>
                {t(languages, 'was_this_helpful')}
            </p>
            <div
                className={tcls(
                    'inline-flex',
                    'items-center',
                    'justify-center',
                    'mt-2',
                    'flex-row',
                    'rounded-full',
                    'ring-1',
                    'ring-inset',
                    'ring-dark/2',
                    'h-8',
                    'dark:ring-light/1',
                )}
            >
                {submitted ? (
                    <p className={tcls('text-sm', 'px-4', 'text-dark/7', 'dark:text-light/6')}>
                        {t(languages, 'was_this_helpful_thank_you')}
                    </p>
                ) : (
                    <div
                        className={tcls(
                            'inline-flex',
                            '[&>*:last-child]:rounded-r-full',
                            '[&>*:first-child]:rounded-l-full',
                        )}
                    >
                        <RatingButton
                            rating={0}
                            label={tString(languages, 'was_this_helpful_negative')}
                            onClick={() => onSubmit(PageFeedbackRating.Bad)}
                        />
                        <RatingButton
                            rating={1}
                            label={tString(languages, 'was_this_helpful_neutral')}
                            onClick={() => onSubmit(PageFeedbackRating.Ok)}
                        />
                        <RatingButton
                            rating={2}
                            label={tString(languages, 'was_this_helpful_positive')}
                            onClick={() => onSubmit(PageFeedbackRating.Good)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function RatingButton(props: { rating: number; label: string; onClick: () => void }) {
    const { rating, label, onClick } = props;

    const ratingIcon =
        rating === 0 ? <Icon0 /> : rating === 1 ? <Icon1 /> : rating === 2 ? <Icon2 /> : null;

    return (
        <button
            className={tcls(
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'h-8',
                'w-8',
                'rounded-sm',
                'text-dark/6',
                'hover:bg-primary/4',
                'hover:text-primary-600',
                'dark:text-light/5',
                'dark:hover:text-primary-300',
                'dark:hover:bg-primary-300/2',
            )}
            aria-label={label}
            title={label}
            onClick={onClick}
        >
            {ratingIcon}
        </button>
    );
}

const Icon0 = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.24" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.66782 13.3737C4.87421 13.5572 5.19025 13.5386 5.3737 13.3322C7.30371 11.1609 10.6963 11.1609 12.6263 13.3322C12.8098 13.5386 13.1258 13.5572 13.3322 13.3737C13.5386 13.1902 13.5572 12.8742 13.3737 12.6678C11.0459 10.049 6.9541 10.049 4.6263 12.6678C4.44284 12.8742 4.46143 13.1902 4.66782 13.3737ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
const Icon1 = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.24" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.5 12C4.5 11.7239 4.72386 11.5 5 11.5H13C13.2761 11.5 13.5 11.7239 13.5 12C13.5 12.2761 13.2761 12.5 13 12.5H5C4.72386 12.5 4.5 12.2761 4.5 12ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
const Icon2 = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.24" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V6C4.25 5.58579 4.58579 5.25 5 5.25C5.41421 5.25 5.75 5.58579 5.75 6V7.5C5.75 7.91421 5.41421 8.25 5 8.25ZM4.66782 11.6263C4.87421 11.4428 5.19025 11.4614 5.3737 11.6678C7.30371 13.8391 10.6963 13.8391 12.6263 11.6678C12.8098 11.4614 13.1258 11.4428 13.3322 11.6263C13.5386 11.8098 13.5572 12.1258 13.3737 12.3322C11.0459 14.951 6.9541 14.951 4.6263 12.3322C4.44284 12.1258 4.46143 11.8098 4.66782 11.6263ZM12.25 7.5C12.25 7.91421 12.5858 8.25 13 8.25C13.4142 8.25 13.75 7.91421 13.75 7.5V6C13.75 5.58579 13.4142 5.25 13 5.25C12.5858 5.25 12.25 5.58579 12.25 6V7.5Z"
            fill="currentColor"
        />
    </svg>
);
