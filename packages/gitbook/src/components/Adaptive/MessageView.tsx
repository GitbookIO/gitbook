import type { AIMessage } from '@gitbook/api';
import { DocumentView } from '../DocumentView';

/**
 * Render a message from the API backend.
 */
export function MessageView(props: {
    message: AIMessage;
}) {
    const { message } = props;

    return (
        <div className="flex flex-col gap-2">
            {message.steps.map((step, index) => {
                return (
                    <div key={index} className="flex flex-col gap-2">
                        <DocumentView
                            document={step.content}
                            context={{
                                mode: 'default',
                                contentContext: undefined,
                                wrapBlocksInSuspense: false,
                            }}
                            style={['space-y-5']}
                        />
                    </div>
                );
            })}
        </div>
    );
}
