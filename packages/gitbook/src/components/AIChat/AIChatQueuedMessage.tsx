import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import { Button, Tooltip } from '../primitives';

/**
 * Shows a follow-up the visitor submitted while the assistant was still answering. It mirrors a
 * sent user message — a right-aligned, tinted bubble — so it reads as "theirs", with a clock icon
 * marking it as pending and a tooltip (on the whole bubble) explaining it will be sent once the
 * current answer finishes. The × beside the bubble drops it from the queue.
 */
export function AIChatQueuedMessage(props: {
    message: string;
    assistantName: string;
    onRemove: () => void;
}) {
    const { message, assistantName, onRemove } = props;
    const language = useLanguage();

    return (
        <div className="flex max-w-[80%] origin-top-right animate-scale-in items-center gap-1 self-end">
            <Tooltip label={t(language, 'ai_chat_queued_message', assistantName)}>
                <div
                    className={tcls(
                        'flex min-w-0 items-center gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md',
                        'bg-primary-solid/1 px-4 py-2 text-tint'
                    )}
                >
                    <Icon icon="clock" className="size-3.5 shrink-0 text-tint" />
                    <span className="min-w-0 break-words">{message}</span>
                </div>
            </Tooltip>
            <Button
                variant="blank"
                size="small"
                iconOnly
                icon="xmark"
                label={t(language, 'clear')}
                onClick={onRemove}
                className="shrink-0 text-tint"
            />
        </div>
    );
}
