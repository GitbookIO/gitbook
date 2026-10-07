'use client';

import React from 'react';

import type { DocumentBlockPrompt } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { PromptActions } from './PromptActions';
import { ToggleChevron } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

type PromptClientProps = DocumentBlockPrompt['data'] & {
    contentIcon: IconName | null;
    prompt: string;
    children?: React.ReactNode;
};

export function PromptClient(props: PromptClientProps) {
    const {
        contentIcon,
        description,
        openInAIProviders = false,
        defaultExpanded = 'hidden',
        prompt,
        children,
    } = props;
    const language = useLanguage();
    const promptId = React.useId();
    const [open, setOpen] = React.useState(defaultExpanded === 'full');
    const isPartiallyExpanded = defaultExpanded === 'partial';
    const expanded = isPartiallyExpanded || open;

    React.useEffect(() => {
        setOpen(defaultExpanded === 'full');
    }, [defaultExpanded]);

    return (
        <div
            className={tcls(
                'relative flex w-full flex-col overflow-hidden circular-corners:rounded-2xl rounded-corners:rounded-xl straight-corners:rounded-xs text-tint-strong',
                'border border-tint-subtle contrast-more:border-tint',
                'transition',
                expanded ? 'bg-tint depth-subtle:shadow-xs' : 'bg-tint-base'
            )}
        >
            <div
                className={tcls(
                    'group/prompt-header relative flex min-h-9 flex-row items-center justify-between gap-4 p-3 transition-colors',
                    !isPartiallyExpanded && (open ? 'hover:bg-tint-hover' : 'hover:bg-tint-subtle')
                )}
            >
                {!isPartiallyExpanded ? (
                    <button
                        type="button"
                        aria-controls={promptId}
                        aria-expanded={open}
                        aria-label={tString(language, 'view')}
                        className={tcls(
                            'absolute inset-0 z-10 cursor-pointer outline-hidden',
                            'focus-visible:ring-2 focus-visible:ring-primary-hover'
                        )}
                        disabled={!prompt}
                        onClick={() => setOpen((prev) => !prev)}
                    />
                ) : null}
                <div className="pointer-events-none relative z-0 flex min-w-0 flex-row items-center gap-2 text-tint-strong">
                    {!isPartiallyExpanded ? (
                        <ToggleChevron
                            open={open}
                            orientation="right-to-down"
                            className="size-3 shrink-0 text-tint-subtle transition-colors group-hover/prompt-header:text-tint-strong"
                        />
                    ) : null}
                    {contentIcon ? <Icon icon={contentIcon} className="size-4 shrink-0" /> : null}
                    <span className="min-w-0 truncate">{description}</span>
                </div>
                <PromptActions prompt={prompt} openInAIProviders={openInAIProviders} />
            </div>
            {isPartiallyExpanded || open ? (
                <div id={promptId} className="border-t border-tint-subtle bg-tint-base">
                    {children}
                </div>
            ) : null}
        </div>
    );
}
