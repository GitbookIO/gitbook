import type { AIChatController, AIChatState } from '../AI';

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
        <div className="flex flex-row flex-wrap gap-4">
            {chat.followUpSuggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    type="button"
                    className="rounded-md bg-tint px-4 py-2"
                    onClick={() => {
                        chatController.postMessage({ message: suggestion });
                    }}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}
