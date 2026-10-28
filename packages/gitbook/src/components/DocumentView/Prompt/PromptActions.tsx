'use client';

import React from 'react';

import { Icon } from '@gitbook/icons';

import { type PromptActionId, setPromptAction, usePromptAction } from './promptAction';
import {
    Button,
    ButtonGroup,
    DropdownMenu,
    DropdownMenuItem,
    ToggleChevron,
} from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { AI_AGENTS, getAIAgent } from '@/lib/ai-agents';
import { tcls } from '@/lib/tailwind';

/** How long the copy button shows its confirmation. */
const COPIED_MESSAGE_DURATION = 1000;

/**
 * Actions of a prompt block: copying the prompt, or handing it to a coding agent. The visitor's
 * last pick becomes the main button, here and in every other prompt block they come across.
 */
export function PromptActions(props: { prompt: string; openInAIProviders: boolean }) {
    const { prompt, openInAIProviders } = props;
    const language = useLanguage();
    const selectedAction = usePromptAction();
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

    const copyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
    };

    // The pick follows the visitor from site to site, so fall back to copying wherever the agent
    // actions are turned off — and with nothing to hand over, an agent link would open an agent on
    // an empty prompt.
    const action: PromptActionId = openInAIProviders && prompt ? selectedAction : 'copy';
    const agent = action === 'copy' ? null : getAIAgent(action);

    const mainButton = agent ? (
        <Button
            variant="secondary"
            size="xsmall"
            icon={agent.icon}
            label={tString(language, 'open_in', agent.label)}
            href={agent.getURL(prompt)}
            // The OS picks the deep link up and the page stays put, where `_blank` would strand the
            // visitor on a tab that never loads anything.
            target="_self"
        />
    ) : (
        <Button
            variant="secondary"
            size="xsmall"
            icon={copied ? 'check' : 'copy'}
            label={copied ? tString(language, 'code_copied') : tString(language, 'prompt_copy')}
            disabled={!prompt}
            onClick={copyPrompt}
        />
    );

    return (
        // Lifted above the header's overlay button, which otherwise swallows the clicks.
        <div className="relative z-20 flex shrink-0 items-center gap-2">
            {openInAIProviders ? (
                <ButtonGroup>
                    {mainButton}
                    <DropdownMenu
                        align="end"
                        className="!min-w-48 max-w-max"
                        button={
                            <Button
                                label={tString(language, 'more')}
                                size="xsmall"
                                variant="secondary"
                                truncate={false}
                                disabled={!prompt}
                            >
                                <span className="flex items-center gap-1.5">
                                    <AgentIconStack />
                                    <ToggleChevron className="size-text-sm" />
                                </span>
                            </Button>
                        }
                    >
                        <DropdownMenuItem
                            active={action === 'copy'}
                            leadingIcon="copy"
                            onClick={() => {
                                setPromptAction('copy');
                                copyPrompt();
                            }}
                        >
                            {tString(language, 'prompt_copy')}
                        </DropdownMenuItem>
                        {AI_AGENTS.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                active={action === item.id}
                                leadingIcon={item.icon}
                                href={item.getURL(prompt)}
                                target="_self"
                                onClick={() => setPromptAction(item.id)}
                            >
                                {tString(language, 'open_in', item.label)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenu>
                </ButtonGroup>
            ) : (
                mainButton
            )}
        </div>
    );
}

/**
 * The agents on offer, overlapped into a stack, so the menu advertises what it holds without
 * spelling out three names next to a button that already has one.
 */
function AgentIconStack() {
    return (
        <span className="flex items-center">
            {AI_AGENTS.map((agent, index) => (
                <span
                    key={agent.id}
                    className={tcls(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border border-tint bg-tint-base',
                        // Each chip's border cuts into the one behind it, so the marks stay legible
                        // however tightly they are stacked.
                        index > 0 && '-ms-1.5'
                    )}
                >
                    <Icon icon={agent.icon} className="size-2.5" />
                </span>
            ))}
        </span>
    );
}
