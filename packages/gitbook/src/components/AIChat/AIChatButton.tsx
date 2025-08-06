'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { useAIChatController } from '../AI';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { getAIChatName } from './AIChat';
import { AIChatIcon } from './AIChatIcon';

/**
 * Button to open/close the AI chat.
 */
export function AIChatButton(props: { trademark: boolean; withLabel: boolean }) {
    const { trademark, withLabel } = props;
    const chatController = useAIChatController();
    const language = useLanguage();

    return (
        <Button
            icon={<AIChatIcon trademark={trademark} />}
            data-testid="ai-chat-button"
            iconOnly={!withLabel}
            size="medium"
            variant="header"
            className={tcls('h-9 px-2.5')}
            label={
                <div className="flex items-center gap-2">
                    {t(language, 'ai_chat_ask', getAIChatName(trademark))}
                    <KeyboardShortcut keys={['mod', 'i']} className="border-tint-11 text-tint-1" />
                </div>
            }
            onClick={() => {
                chatController.open();
            }}
        >
            {withLabel ? <span className="max-md:hidden">{t(language, 'ask')}</span> : null}
        </Button>
    );
}
