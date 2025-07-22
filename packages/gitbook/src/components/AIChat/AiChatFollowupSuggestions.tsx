import type { AIChatController, AIChatState } from '../AI';
import { Button } from '../primitives';

/**
 * Display follow-up suggestions for the user to pick from.
 */
export function AIChatFollowupSuggestions(props: {
    chat: AIChatState;
    chatController: AIChatController;
}) {
    const { chat, chatController } = props;

    if (chat.followUpSuggestions.length === 0) {
        return null;
    }

    return (
        <div className="mt-auto flex flex-row flex-wrap justify-end gap-2">
            {chat.followUpSuggestions.map((suggestion, index) => (
                <Button
                    key={index}
                    onClick={() => {
                        chatController.postMessage({ message: suggestion });
                    }}
                    label={suggestion}
                    className="animate-[present_500ms_both] whitespace-normal text-left ring-1 ring-tint-subtle"
                    size="medium"
                    variant="blank"
                    style={{
                        animationDelay: `${250 + Math.min(index * 50, 150)}ms`,
                    }}
                />
            ))}
        </div>
    );
}
