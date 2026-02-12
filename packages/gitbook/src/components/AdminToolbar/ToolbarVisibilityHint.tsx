'use client';

import { motion } from 'motion/react';
import React from 'react';
import { getVisibilityHintDismissed, setVisibilityHintDismissed } from './utils';

interface ToolbarVisibilityHintProps {
    show: boolean;
}

export function ToolbarVisibilityHint(props: ToolbarVisibilityHintProps) {
    const { show } = props;
    const [dismissed, setDismissed] = React.useState(() =>
        typeof window !== 'undefined' ? getVisibilityHintDismissed() : false
    );

    if (dismissed) {
        return null;
    }

    return (
        <motion.div
            initial={false}
            animate={{
                y: show ? 0 : 10,
                opacity: show ? 1 : 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
            }}
            className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 flex items-center gap-1.5 rounded-t-xl border border-[#eaeaea] border-b-0 border-solid bg-white px-3 py-0.5"
        >
            <span className="whitespace-nowrap text-[11px] text-neutral-9">
                Only visible to your GitBook organization
            </span>
            <button
                type="button"
                className="pointer-events-auto cursor-pointer rounded border border-tint-5 bg-tint-2 px-1 py-px text-[10px] text-tint-12 transition-colors hover:scale-102 hover:bg-tint-3 dark:border-tint-11/50 dark:bg-white dark:text-tint-1 dark:hover:bg-tint-11/20"
                onClick={(e) => {
                    e.stopPropagation();
                    setVisibilityHintDismissed();
                    setDismissed(true);
                }}
            >
                Dismiss
            </button>
        </motion.div>
    );
}
