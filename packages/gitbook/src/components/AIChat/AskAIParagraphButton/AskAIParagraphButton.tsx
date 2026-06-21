'use client';

import fnv1a from '@sindresorhus/fnv1a';

import { useAIChatController, useAIConfig } from '@/components/AI';
import { Button } from '@/components/primitives';
import { t, tString, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { getAIChatName } from '../AIChat';
import { AIChatIcon } from '../AIChatIcon';

/**
 * A small icon button revealed in the left margin of a top-level paragraph when it is hovered (on
 * devices with a fine pointer). Clicking it stages the paragraph's text as a reference and opens
 * the AI chat — a more discoverable variant of the text-selection "Ask" affordance.
 *
 * The button is absolutely positioned so it never affects the document flow, and its visibility is
 * driven purely by the `group/ask-ai` hover state of its paragraph wrapper.
 */
export function AskAIParagraphButton(props: { content: string; className?: ClassValue }) {
    const { content, className } = props;
    const config = useAIConfig();
    const language = useLanguage();
    const chatController = useAIChatController();

    const onClick = () => {
        const text = content.trim();
        if (!text) {
            return;
        }

        chatController.addReference({
            type: 'text',
            id: `text-${fnv1a(text, { size: 32 })}`,
            content: text,
        });
        chatController.open();
        chatController.focus();
    };

    return (
        <div
            className={tcls(
                // Sit in the left margin, flush against the paragraph so there is no hover gap.
                'absolute top-0 right-full z-10 pr-1',
                // Per-block nudges: `in-[…]` matches an ancestor (tag or class) with no markup
                // changes elsewhere — add a self-contained rule per block type to clear its gutter.
                'in-[.hint]:-top-0.5 in-[.hint]:pr-2',
                'in-[blockquote]:pr-0',
                // Hover affordance only: hidden until the paragraph (or the button) is hovered.
                'invisible opacity-0 transition-opacity duration-150',
                'hover:visible hover:opacity-100 group-hover/ask-ai:visible group-hover/ask-ai:opacity-100',
                // Never shown on touch / hover-less contexts.
                'not-pointer-fine:hidden',
                'in-[[role=table]]:hidden',
                className
            )}
        >
            <Button
                variant="blank"
                size="xsmall"
                iconOnly
                icon={<AIChatIcon state="default" trademark={config.trademark} />}
                label={t(
                    language,
                    'ai_chat_ask_about',
                    config.assistantName ?? getAIChatName(language, config.trademark),
                    tString(language, 'this_text')
                )}
                onClick={onClick}
                // Don't steal focus (and shift the scroll position) when clicked with the mouse.
                onMouseDown={(event) => event.preventDefault()}
                className={tcls(
                    'bg-tint-base',
                    'in-[.hint.bg-danger]:bg-danger in-[.hint.bg-info]:bg-info in-[.hint.bg-success]:bg-success in-[.hint.bg-warning]:bg-warning'
                )}
            />
        </div>
    );
}
