'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import type { Assistant } from '../AI';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

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

    return (
        <Button
            icon={assistant.icon}
            data-testid="ai-chat-button"
            iconOnly={!showLabel}
            size="medium"
            variant="header"
            className={tcls('h-9 px-2.5')}
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
            {showLabel ? <span className="max-md:hidden">{t(language, 'ask')}</span> : null}
        </Button>
    );
}
