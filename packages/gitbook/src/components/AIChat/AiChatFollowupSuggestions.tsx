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
            <div className="sticky bottom-0 mt-auto flex flex-col items-start gap-2">
                {chat.followUpSuggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        onClick={() => {
                            chatController.postMessage({ message: suggestion });
                        }}
                        label={suggestion}
                        className="starting:h-0 max-w-full origin-left animate-blur-in-slow whitespace-normal border-none bg-primary-11/1 px-3 py-1.5 starting:py-0 transition-all transition-discrete duration-500 *:whitespace-normal hover:bg-primary-hover"
                        size="medium"
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
