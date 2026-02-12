'use client';

import React from 'react';

import { useLanguage } from '@/intl/client';
import { AnimatePresence, motion } from 'motion/react';
import { formatDateTime, formatDateWeekday, formatRelative } from '../utils/dates';

type DateFormat = 'relative' | 'weekday' | 'full';

const DATE_FORMATS: DateFormat[] = ['relative', 'weekday', 'full'];

/**
 * Toolbar-specific date display that cycles between relative, weekday, and full formats on click.
 */
export function ToolbarDate(props: { value: string }) {
    const { value } = props;
    const language = useLanguage();
    const [formatIndex, setFormatIndex] = React.useState(0);

    const format = DATE_FORMATS[formatIndex] as DateFormat;

    const formatted = React.useMemo(() => {
        const date = new Date(value);
        switch (format) {
            case 'relative':
                return formatRelative(language.locale, Date.now() - date.getTime());
            case 'weekday':
                return formatDateWeekday(date, language.locale);
            case 'full':
                return formatDateTime(date, language.locale);
        }
    }, [format, language.locale, value]);

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
                className="relative inline-flex min-w-24 cursor-pointer select-none overflow-hidden font-semibold transition-colors hover:text-white" // `text-white` is used insead of dark-mode adapting values because the date is always in a dark-tinted toolbar
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
