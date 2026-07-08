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
}) {
    const { contentIcon, description, prompt, openInAIProviders } = props;
    const language = useLanguage();
    const promptId = React.useId();
    const [open, setOpen] = React.useState(false);
    const [headerHasFocus, setHeaderHasFocus] = React.useState(false);
    return (
        <>
            <div className="group/prompt-header relative flex min-h-9 flex-row items-center justify-between gap-4 p-3">
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
                    onBlur={() => setHeaderHasFocus(false)}
                    onClick={() => setOpen((prev) => !prev)}
                    onFocus={() => setHeaderHasFocus(true)}
                />
                <div className="pointer-events-none relative z-0 flex min-w-0 flex-row items-center gap-2 text-tint-strong">
                    <PromptDisclosureIcon
                        contentIcon={contentIcon}
                        headerHasFocus={headerHasFocus}
                        open={open}
                    />
                    <span className="min-w-0 truncate">{description}</span>
                </div>
                <PromptActions prompt={prompt} openInAIProviders={openInAIProviders} />
            </div>
            {open ? (
                <div id={promptId} className="border-tint-subtle border-t bg-tint-base">
                    <pre className="overflow-auto p-4 text-sm text-tint-strong">
                        <code className="language-markdown whitespace-pre-wrap font-mono">
                            {prompt}
                        </code>
                    </pre>
                </div>
            ) : null}
        </>
    );
}

function PromptDisclosureIcon(props: {
    contentIcon: IconName | null;
    headerHasFocus: boolean;
    open: boolean;
}) {
    const { contentIcon, headerHasFocus, open } = props;
    return (
        <span className="relative flex size-4 shrink-0 items-center justify-center">
            {contentIcon ? (
                <>
                    <span
                        className={tcls(
                            'flex items-center transition-opacity duration-150 group-hover/prompt-header:opacity-0',
                            headerHasFocus && 'opacity-0'
                        )}
                    >
                        <Icon icon={contentIcon} className="size-4 shrink-0" />
                    </span>
                    <span
                        className={tcls(
                            'absolute inset-0 flex items-center justify-center text-tint-subtle opacity-0 transition-opacity duration-150 group-hover/prompt-header:opacity-100',
                            headerHasFocus && 'opacity-100'
                        )}
                    >
                        <ToggleChevron open={open} orientation="right-to-down" className="size-3" />
                    </span>
                </>
            ) : (
                <ToggleChevron
                    open={open}
                    orientation="right-to-down"
                    className="size-3 text-tint-subtle"
                />
            )}
        </span>
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
            variant="secondary"
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
                    variant="primary"
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
