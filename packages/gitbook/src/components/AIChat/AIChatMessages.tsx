import type { AIChatState } from '../AI/useAIChat';

export function AIChatMessages(props: {
    chat: AIChatState;
}) {
    const { chat } = props;

    return (
        <div className="flex flex-col gap-2">
            {chat.messages.map((message, index) => {
                return <div key={index}>{message.content}</div>;
            })}
        </div>
    );
}
