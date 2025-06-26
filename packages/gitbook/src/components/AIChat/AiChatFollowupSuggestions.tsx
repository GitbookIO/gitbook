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
        <div className="flex flex-row flex-wrap justify-end gap-2 pt-8">
            {chat.followUpSuggestions.map((suggestion, index) => (
                <Button
                    key={index}
                    onClick={() => {
                        chatController.postMessage({ message: suggestion });
                    }}
                    label={suggestion}
                    className="max-w-full animate-[present_500ms_both] whitespace-normal text-right"
                    size="medium"
                    variant="secondary"
                    style={{
                        animationDelay: `${250 + Math.min(index * 50, 150)}ms`,
                    }}
                />
            ))}
        </div>
    );
}
