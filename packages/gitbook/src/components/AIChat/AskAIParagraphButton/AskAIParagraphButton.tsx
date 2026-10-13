'use client';

import fnv1a from '@sindresorhus/fnv1a';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { AIChatIcon } from '../AIChatIcon';
import { useAIChatController, useAIConfig } from '@/components/AI';
import { Button } from '@/components/primitives';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

/**
 * A small icon button revealed in the left margin of a paragraph when it is hovered (on devices
 * with a fine pointer). Clicking it stages the paragraph's text as a reference and opens the AI
 * chat — a more discoverable variant of the text-selection "Ask" affordance.
 *
 * A single instance is portaled into the last hovered paragraph wrapper, rather than rendering one
 * per paragraph, so pages with many paragraphs don't pay for markup that is hidden until hovered.
 * Its visibility is still driven purely by the `group/ask-ai` hover state of that wrapper.
 */
export function AskAIParagraphButton() {
    const config = useAIConfig();
    const language = useLanguage();
    const chatController = useAIChatController();
    const [target, setTarget] = React.useState<HTMLElement | null>(null);

    const enabled = isAIChatEnabled(config.aiMode);

    React.useEffect(() => {
        if (!enabled) {
            return;
        }

        const onPointerOver = (event: PointerEvent) => {
            if (!(event.target instanceof Element)) {
                return;
            }
            const wrapper = event.target.closest<HTMLElement>('[data-ask-ai-paragraph]');
            if (wrapper) {
                setTarget(wrapper);
            }
        };

        document.addEventListener('pointerover', onPointerOver);
        return () => document.removeEventListener('pointerover', onPointerOver);
    }, [enabled]);

    if (!enabled || !target) {
        return null;
    }

    const onClick = () => {
        const text = getParagraphText(target).trim();
        if (!text) {
            return;
        }

        chatController.addReference({
            type: 'text',
            id: `text-${fnv1a(text, { size: 32 })}`,
            content: text,
        });
        chatController.open('hover');
        chatController.setDraft(tString(language, 'ai_chat_paragraph_draft'));
        chatController.focus();
    };

    return createPortal(
        <div
            className={tcls(
                // Sit in the left margin, flush against the paragraph so there is no hover gap.
                'absolute top-0 right-full z-10 pr-1',
                // Per-block nudges: `in-[…]` matches an ancestor (tag or class) with no markup
                // changes elsewhere — add a self-contained rule per block type to clear its gutter.
                'in-[.hint]:-top-0.5 in-[.hint]:pr-2',
                'in-[li]:-left-14',
                'in-[blockquote]:pr-0',
                // Hover affordance only: hidden until the paragraph (or the button) is hovered.
                'invisible opacity-0 transition-opacity duration-150',
                'hover:visible hover:opacity-100 group-hover/ask-ai:visible group-hover/ask-ai:opacity-100',
                // Never shown on touch / hover-less contexts.
                'not-pointer-fine:hidden'
            )}
        >
            <Button
                variant="blank"
                size="xsmall"
                iconOnly
                icon={<AIChatIcon state="default" trademark={config.trademark} />}
                label={t(language, 'ask')}
                onClick={onClick}
                // Don't steal focus (and shift the scroll position) when clicked with the mouse.
                onMouseDown={(event) => event.preventDefault()}
                className={tcls(
                    'bg-tint-base',
                    'in-[.hint.bg-danger]:bg-danger in-[.hint.bg-info]:bg-info in-[.hint.bg-success]:bg-success in-[.hint.bg-warning]:bg-warning'
                )}
            />
        </div>,
        target
    );
}

/**
 * Read the paragraph's text, skipping rendered math like `getNodeText` does.
 */
function getParagraphText(wrapper: HTMLElement): string {
    const paragraph = wrapper.querySelector(':scope > p');
    if (!paragraph) {
        return '';
    }

    const walker = document.createTreeWalker(
        paragraph,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) =>
                node instanceof Element &&
                node.matches('.katex, mjx-container, [aria-hidden="true"]')
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT,
        }
    );

    let text = '';
    while (walker.nextNode()) {
        if (walker.currentNode.nodeType === Node.TEXT_NODE) {
            text += walker.currentNode.textContent ?? '';
        }
    }
    return text;
}
