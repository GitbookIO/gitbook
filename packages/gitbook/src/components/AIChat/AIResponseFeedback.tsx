'use client';

import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { type ClassValue, tcls } from '@/lib/tailwind';
import { useState } from 'react';
import { useTrackEvent } from '../Insights';
import { Button } from '../primitives';

export function AIResponseFeedback(props: {
    className?: ClassValue;
    responseId: string;
    query: string;
}) {
    const { className, responseId, query } = props;

    const language = useLanguage();
    const [rating, setRating] = useState<1 | -1 | null>(null);
    const trackEvent = useTrackEvent();

    const handleRating = (rating: 1 | -1) => {
        setRating(rating);
        trackEvent({ type: 'ask_rate_response', query, responseId, rating });
    };

    return (
        <div className={tcls('flex h-fit items-center', className)}>
            <Button
                icon="thumbs-up"
                iconOnly
                label={tString(language, 'was_this_helpful_positive_label')}
                variant="blank"
                className={tcls(
                    'animate-fade-in overflow-hidden text-tint-subtle transition-all',
                    rating !== null && rating !== 1 && 'px-0 text-[0rem] opacity-0'
                )}
                size="medium"
                style={{ animationDuration: '.5s' }}
                onClick={() => handleRating(1)}
                disabled={rating !== null}
                active={rating === 1}
                key="positive"
            />
            <Button
                icon="thumbs-down"
                iconOnly
                label={tString(language, 'was_this_helpful_negative_label')}
                variant="blank"
                className={tcls(
                    'animate-fade-in overflow-hidden text-tint-subtle transition-all',
                    rating !== null && rating !== -1 && 'px-0 text-[0rem] opacity-0'
                )}
                size="medium"
                style={{ animationDelay: '.2s', animationDuration: '.5s' }}
                onClick={() => handleRating(-1)}
                disabled={rating !== null}
                active={rating === -1}
                key="negative"
            />
            {rating !== null ? (
                <span
                    className="ml-2 animate-fade-in-slow text-tint-subtle"
                    style={{ animationDelay: '.3s' }}
                >
                    {t(language, 'was_this_helpful_thank_you')}
                </span>
            ) : null}
        </div>
    );
}
