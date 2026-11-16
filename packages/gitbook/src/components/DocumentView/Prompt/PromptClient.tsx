'use client';

import React from 'react';

import type { DocumentBlockPrompt } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { PromptActions } from './PromptActions';
import { ToggleChevron } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { cx } from '@/lib/classnames';

type PromptClientProps = DocumentBlockPrompt['data'] & {
    contentIcon: IconName | null;
    prompt: string;
    /** Comment target: its code nodes aren't, so the prompt owns clicks inside it. */
    commentKey?: string;
    className?: string;
    children?: React.ReactNode;
};

export function PromptClient(props: PromptClientProps) {
    const {
        contentIcon,
        description,
        openInAIProviders = false,
        defaultExpanded = 'hidden',
        prompt,
        commentKey,
        className,
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
            data-block-key={commentKey}
            data-comment-block={commentKey ? '' : undefined}
            className={cx('prompt-block', expanded && 'prompt-block-expanded', className)}
        >
            <div
                className={cx(
                    // The marker stays for the chevron's `group-hover/prompt-header`.
                    'group/prompt-header prompt-header',
                    !isPartiallyExpanded && (open ? 'prompt-header-open' : 'prompt-header-closed')
                )}
            >
                {!isPartiallyExpanded ? (
                    <button
                        type="button"
                        aria-controls={promptId}
                        aria-expanded={open}
                        aria-label={tString(language, 'view')}
                        className="prompt-toggle"
                        disabled={!prompt}
                        onClick={() => setOpen((prev) => !prev)}
                    />
                ) : null}
                <div className="prompt-title">
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
                <div id={promptId} className="prompt-body">
                    {children}
                </div>
            ) : null}
        </div>
    );
}
