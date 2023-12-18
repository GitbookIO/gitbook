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
        <div>
            <p className={tcls('text-sm')}>{t(languages, 'was_this_helpful')}</p>

            {submitted ? (
                <p>{t(languages, 'was_this_helpful_thank_you')}</p>
            ) : (
                <div className={tcls('flex', 'flex-row', 'gap-2')}>
                    <RatingButton
                        emoji="☹️"
                        label={tString(languages, 'was_this_helpful_negative')}
                        onClick={() => onSubmit(PageFeedbackRating.Bad)}
                    />
                    <RatingButton
                        emoji="😕"
                        label={tString(languages, 'was_this_helpful_neutral')}
                        onClick={() => onSubmit(PageFeedbackRating.Ok)}
                    />
                    <RatingButton
                        emoji="😃"
                        label={tString(languages, 'was_this_helpful_positive')}
                        onClick={() => onSubmit(PageFeedbackRating.Good)}
                    />
                </div>
            )}
        </div>
    );
}

function RatingButton(props: { emoji: string; label: string; onClick: () => void }) {
    const { emoji, label, onClick } = props;
    return (
        <button
            className={tcls(
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'p-2',
                'rounded',
                'text-base',
                'text-gray-500',
                'hover:text-gray-900',
                'focus:outline-none',
                'focus:ring',
                'focus:ring-gray-300',
                'focus:ring-offset-2',
                'focus:ring-offset-white',
            )}
            aria-label={label}
            title={label}
            onClick={onClick}
        >
            {emoji}
        </button>
    );
}
