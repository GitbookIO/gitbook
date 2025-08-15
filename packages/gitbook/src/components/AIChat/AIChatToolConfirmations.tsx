import type { AIChatState } from '../AI';
import { Button } from '../primitives';

/**
 * Display buttons to confirm tool calls.
 */
export function AIChatToolConfirmations(props: {
    chat: AIChatState;
}) {
    const { chat } = props;

    if (chat.pendingTools.length === 0) {
        return null;
    }

    return (
        <div className="flex w-full flex-wrap justify-end gap-2">
            {chat.pendingTools.map((tool, index) => (
                <Button
                    key={index}
                    onClick={() => {
                        tool.confirm();
                    }}
                    label={tool.label}
                    className="whitespace-normal! max-w-full animate-[present_500ms_both] text-left ring-1 ring-tint-subtle"
                    size="medium"
                    variant="primary"
                    icon={tool.icon}
                    style={{
                        animationDelay: `${250 + Math.min(index * 50, 150)}ms`,
                    }}
                />
            ))}
        </div>
    );
}
