import type { AskSession } from './state';

export function AskMessages(props: {
    session: AskSession;
}) {
    const { session } = props;

    return (
        <div className="flex flex-col gap-2">
            {session.messages.map((message, index) => {
                return <div key={index}>{message.content}</div>;
            })}
        </div>
    );
}
