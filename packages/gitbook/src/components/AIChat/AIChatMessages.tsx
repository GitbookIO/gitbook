import { tcls } from '@/lib/tailwind';
import type { AIChatState } from '../AI/useAIChat';

export function AIChatMessages(props: {
    chat: AIChatState;
}) {
    const { chat } = props;

    return (
        <div className="flex flex-col gap-4">
            {chat.messages.map((message, index) => {
                return (
                    <div
                        className={tcls(
                            message.role === 'user'
                                ? 'max-w-[80%] self-end rounded-md bg-tint px-4 py-2'
                                : ''
                        )}
                        key={index}
                    >
                        {message.content ? (
                            message.content
                        ) : (
                            <div className="flex w-full flex-wrap gap-2">
                                {Array.from({ length: 7 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-4 animate-[fadeIn_0.5s_both,pulse_1.5s_infinite] rounded-md bg-tint-4"
                                        style={{
                                            width: `calc(${(index % 4) * 20 + 10}% - 4px)`,
                                            animationDelay: `${index * 0.2}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
