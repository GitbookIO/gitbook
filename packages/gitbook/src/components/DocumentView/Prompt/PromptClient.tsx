'use client';

import { Button, DropdownMenu, DropdownMenuItem, ToggleChevron } from '@/components/primitives';
import { getURLForLLM } from '@/components/utils';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';

const OPEN_IN_AI_PROVIDERS = ['claude', 'chatgpt', 'cursor'] as const;
type AIProviders = (typeof OPEN_IN_AI_PROVIDERS)[number];

export function PromptClient(props: {
    contentIcon: IconName | null;
    description: string;
    prompt: string;
    openInAIProviders: boolean;
    preview: boolean;
    children?: React.ReactNode;
}) {
    const { contentIcon, description, prompt, openInAIProviders, preview, children } = props;
    const language = useLanguage();
    const promptId = React.useId();
    const [open, setOpen] = React.useState(false);
    const expanded = preview || open;
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
                    !preview && (open ? 'hover:bg-tint-hover' : 'hover:bg-tint-subtle')
                )}
            >
                {!preview ? (
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
                    {!preview ? (
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
            {preview || open ? (
                <div id={promptId} className="border-tint-subtle border-t bg-tint-base">
                    {children}
                </div>
            ) : null}
        </div>
    );
}

function PromptActions(props: { prompt: string; openInAIProviders: boolean }) {
    const { prompt, openInAIProviders } = props;

    return (
        <div className="relative z-20 flex shrink-0 items-center gap-2">
            <CopyPromptButton prompt={prompt} />
            {openInAIProviders ? <OpenPromptDropdown prompt={prompt} /> : null}
        </div>
    );
}

// time in milliseconds to show the "Copied" message after copying a prompt
const COPIED_MESSAGE_DURATION = 1000;

function CopyPromptButton(props: { prompt: string }) {
    const { prompt } = props;
    const language = useLanguage();
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = setTimeout(() => {
            setCopied(false);
        }, COPIED_MESSAGE_DURATION);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    return (
        <Button
            variant="primary"
            size="xsmall"
            label={copied ? tString(language, 'code_copied') : tString(language, 'prompt_copy')}
            disabled={!prompt}
            onClick={() => {
                navigator.clipboard.writeText(prompt);
                setCopied(true);
            }}
        />
    );
}

function OpenPromptDropdown(props: { prompt: string }) {
    const { prompt } = props;
    const language = useLanguage();

    return (
        <DropdownMenu
            align="end"
            className="!min-w-48 max-w-max"
            button={
                <Button
                    label={tString(language, 'open_in_ai')}
                    trailing={<ToggleChevron className="size-text-sm" />}
                    size="xsmall"
                    variant="secondary"
                    className="max-sm:hidden"
                    disabled={!prompt}
                />
            }
        >
            {OPEN_IN_AI_PROVIDERS.map((provider) => {
                const definition = getPromptOpenActionDefinition(provider);
                return (
                    <DropdownMenuItem
                        key={provider}
                        href={getURLForLLM(provider, prompt)}
                        target="_blank"
                        leadingIcon={definition.icon}
                    >
                        {tString(language, 'open_in', definition.label)}
                    </DropdownMenuItem>
                );
            })}
        </DropdownMenu>
    );
}

function getPromptOpenActionDefinition(action: AIProviders): { icon: IconName; label: string } {
    switch (action) {
        case 'cursor':
            return {
                icon: 'cursor',
                label: 'Cursor',
            };
        case 'claude':
            return {
                icon: 'claude',
                label: 'Claude',
            };
        case 'chatgpt':
            return {
                icon: 'chatgpt',
                label: 'ChatGPT',
            };
    }
}
