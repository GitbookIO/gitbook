import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';

/**
 * Shows the follow-up a visitor submitted while the assistant was still answering, with a note
 * that it will be sent once the current answer finishes and an × to drop it from the queue.
 */
export function AIChatQueuedMessage(props: {
    message: string;
    assistantName: string;
    onRemove: () => void;
}) {
    const { message, assistantName, onRemove } = props;
    const language = useLanguage();

    return (
        <div
            className={tcls(
                'flex items-start gap-2 circular-corners:rounded-2xl rounded-corners:rounded-lg',
                'border border-tint-subtle bg-tint-base/9 p-2 pl-3 text-sm backdrop-blur-lg'
            )}
        >
            <div className="flex min-w-0 grow flex-col gap-0.5">
                <span className="truncate text-tint-strong">{message}</span>
                <span className="text-tint text-xs">
                    {t(language, 'ai_chat_queued_message', assistantName)}
                </span>
            </div>
            <Button
                variant="blank"
                size="small"
                iconOnly
                icon="xmark"
                label={t(language, 'clear')}
                onClick={onRemove}
                className="-my-1 -mr-1 shrink-0 text-tint"
            />
        </div>
    );
}
