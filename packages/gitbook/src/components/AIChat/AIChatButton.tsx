'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import type { Assistant } from '../AI';
import { useIsMobile } from '../hooks/useIsMobile';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

const MOBILE_BREAKPOINT = 672; // 42rem, equal to Tailwind's @max-2xl container breakpoint

/**
 * Button to open/close the AI chat.
 */
export function AIChatButton(props: {
    assistant: Assistant;
    showLabel?: boolean;
    withShortcut?: boolean;
}) {
    const { assistant, showLabel = true, withShortcut = true } = props;
    const language = useLanguage();
    const isMobile = useIsMobile(MOBILE_BREAKPOINT, '#header-content');

    return (
        <Button
            icon={assistant.icon}
            data-testid="ai-chat-button"
            iconOnly={!showLabel || isMobile}
            size="medium"
            variant="header"
            aria-label={tString(language, 'ai_chat_ask', assistant.label)}
            label={
                <div className="flex items-center gap-2">
                    {t(language, 'ai_chat_ask', assistant.label)}
                    {withShortcut ? (
                        <KeyboardShortcut
                            keys={['mod', 'i']}
                            className="border-tint-11 text-tint-1"
                        />
                    ) : null}
                </div>
            }
            onClick={() => assistant.open()}
        >
            {showLabel ? t(language, 'ask') : null}
        </Button>
    );
}
