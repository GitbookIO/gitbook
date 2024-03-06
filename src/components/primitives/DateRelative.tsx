'use client';

import React from 'react';

import { useLanguage } from '@/intl/client';

/**
 * Display a date as a relative time.
 */
export function DateRelative(props: { value: string }) {
    const { value } = props;
    const language = useLanguage();
    const [now, setNow] = React.useState<number>(Date.now());

    React.useEffect(() => {
        const interval = setInterval(
            () => {
                setNow(Date.now());
            },
            30 * 60 * 1000,
        );

        return () => {
            clearInterval(interval);
        };
    }, []);

    const date = new Date(value);
    const diff = now - date.getTime();
    return (
        <time suppressHydrationWarning={true} dateTime={value} title={date.toLocaleString()}>
            {formatDiff(language.locale, diff)}
        </time>
    );
}

function formatDiff(locale: string, diff: number) {
    if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat === 'undefined') {
        // Fallback for old browsers
        const days = Math.floor(diff / 24 / 60 / 60 / 1000);
        return `${days} days ago`;
    }

    const rtf = new Intl.RelativeTimeFormat(locale, { style: 'long' });

    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / 60 / 1000);
        return rtf.format(-minutes, 'minute');
    }

    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / 60 / 60 / 1000);
        return rtf.format(-hours, 'hour');
    }

    if (diff < 30 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / 24 / 60 / 60 / 1000);
        return rtf.format(-days, 'day');
    }

    if (diff < 365 * 24 * 60 * 60 * 1000) {
        const months = Math.floor(diff / 30 / 24 / 60 / 60 / 1000);
        return rtf.format(-months, 'month');
    }

    const years = Math.floor(diff / 365 / 24 / 60 / 60 / 1000);
    return rtf.format(-years, 'year');
}
