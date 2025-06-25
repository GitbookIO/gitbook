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
                    className="animate-present"
                    size="medium"
                    variant="secondary"
                />
            ))}
        </div>
    );
}
