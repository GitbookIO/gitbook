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
        <div className="flex grow flex-col">
            <div
                className="sticky bottom-0 mt-auto flex max-w-full flex-col items-start gap-2"
                data-testid="ai-chat-followup-suggestions"
            >
                {chat.followUpSuggestions.map((suggestion, index) => (
                    <Button
                        truncate={false}
                        data-testid="ai-chat-followup-suggestion"
                        key={index}
                        onClick={() => {
                            chatController.postMessage({ message: suggestion });
                        }}
                        label={suggestion}
                        className="starting:h-0 max-w-full origin-left animate-blur-in-slow border-none bg-primary-11/1 starting:py-0 text-left transition-all transition-discrete duration-500 hover:bg-primary-hover"
                        size="small"
                        variant="blank"
                        style={{
                            animationDelay: `${250 + Math.min(index * 50, 150)}ms`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
