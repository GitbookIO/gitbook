'use client';

import React from 'react';

import { useLanguage } from '@/intl/client';
import { AnimatePresence, motion } from 'motion/react';

type DateFormat = 'relative' | 'weekday' | 'full';

const DATE_FORMATS: DateFormat[] = ['relative', 'weekday', 'full'];

/**
 * Toolbar-specific date display that cycles between relative, weekday, and full formats on click.
 */
export function ToolbarDate(props: { value: string }) {
    const { value } = props;
    const language = useLanguage();
    const [now, setNow] = React.useState<number>(Date.now());
    const [formatIndex, setFormatIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(
            () => {
                setNow(Date.now());
            },
            30 * 60 * 1000
        );

        return () => {
            clearInterval(interval);
        };
    }, []);

    const date = new Date(value);
    const format = DATE_FORMATS[formatIndex] as DateFormat;

    const formatted = React.useMemo(() => {
        return formatDateValue(format, language.locale, now, date);
    }, [format, language.locale, now, date]);

    return (
        <div className="inline-flex items-center gap-1">
            {/* Vertical dots indicating cycleable formats */}
            <div className="flex flex-col items-center gap-[1px]">
                {DATE_FORMATS.map((fmt, i) => (
                    <motion.span
                        key={fmt}
                        animate={{
                            opacity: i === formatIndex ? 1 : 0.3,
                            scale: i === formatIndex ? 1 : 0.75,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="block size-[3px] rounded-full bg-current"
                    />
                ))}
            </div>
            <time
                data-visual-test="transparent"
                suppressHydrationWarning={true}
                dateTime={value}
                onClick={(e) => {
                    e.stopPropagation();
                    setFormatIndex((i) => (i + 1) % DATE_FORMATS.length);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormatIndex((i) => (i + 1) % DATE_FORMATS.length);
                    }
                }}
                className="relative inline-flex min-w-24 cursor-pointer overflow-hidden font-semibold transition-colors hover:text-white"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={formatIndex}
                        initial={{ y: '-100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {formatted}
                    </motion.span>
                </AnimatePresence>
            </time>
        </div>
    );
}

function formatDateValue(format: DateFormat, locale: string, now: number, date: Date): string {
    switch (format) {
        case 'relative':
            return formatRelative(locale, now - date.getTime());
        case 'weekday':
            return date.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        case 'full':
            return date.toLocaleString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
    }
}

function formatRelative(locale: string, diff: number) {
    if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat === 'undefined') {
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
