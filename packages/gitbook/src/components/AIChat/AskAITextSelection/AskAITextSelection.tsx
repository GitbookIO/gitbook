'use client';

import { CustomizationAIMode } from '@gitbook/api';
import fnv1a from '@sindresorhus/fnv1a';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useAIChatController, useAIConfig } from '@/components/AI';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useIsMounted } from '@/components/hooks/useIsMounted';
import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';

import { AIChatIcon } from '../AIChatIcon';
import { useStableTextSelection } from './useStableTextSelection';

/** Gap between the selection and the button. */
const GAP = 8;
/** Minimum distance to the viewport edges. */
const MARGIN = 8;

/**
 * Floating "Ask" button anchored above a text selection. Clicking it stages the selection as a
 * reference and opens the AI chat. Only rendered in Assistant mode, on non-touch devices.
 */
export function AskAITextSelection() {
    const config = useAIConfig();
    const language = useLanguage();
    const chatController = useAIChatController();
    const isMobile = useIsMobile();
    const isMounted = useIsMounted();

    const enabled = config.aiMode === CustomizationAIMode.Assistant && !isMobile;

    const toolbarRef = React.useRef<HTMLDivElement>(null);
    const { selection, clear } = useStableTextSelection({
        rootSelector: '[data-content-ref-root]',
        enabled,
        ignoreRef: toolbarRef,
    });

    const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

    // Position once the button has been measured, so it can be centered and clamped to the viewport.
    React.useLayoutEffect(() => {
        if (!selection) {
            return;
        }
        const el = toolbarRef.current;
        if (!el) {
            return;
        }

        const width = el.offsetWidth;
        const height = el.offsetHeight;
        const { anchor } = selection;

        let top = anchor.top - GAP - height;
        if (top < MARGIN) {
            // Not enough room above the selection: drop below it.
            top = anchor.bottom + GAP;
        }
        top = Math.min(top, window.innerHeight - height - MARGIN);

        const left = Math.min(
            Math.max(anchor.centerX - width / 2, MARGIN),
            window.innerWidth - width - MARGIN
        );

        setCoords({ top, left });
    }, [selection]);

    const onClick = () => {
        if (!selection) {
            return;
        }
        const content = selection.text;
        if (!content.trim()) {
            return;
        }

        chatController.addReference({
            type: 'text',
            id: `text-${fnv1a(content, { size: 32 })}`,
            content,
        });
        chatController.open();
        chatController.focus();
        clear();
    };

    if (!enabled || !isMounted) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {selection ? (
                <motion.div
                    ref={toolbarRef}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: coords ? 1 : 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        top: coords?.top ?? 0,
                        left: coords?.left ?? 0,
                        zIndex: 40,
                    }}
                    // Keep the selection alive: prevent the button from stealing focus on click.
                    onMouseDown={(event) => event.preventDefault()}
                >
                    <Button
                        size="small"
                        variant="primary"
                        icon={<AIChatIcon state="default" trademark={config.trademark} />}
                        onClick={onClick}
                        className="shadow-sm"
                    >
                        {t(language, 'ask')}
                    </Button>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
}
