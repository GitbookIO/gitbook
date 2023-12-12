import { SearchAIAnswer } from '@gitbook/api';
import React from 'react';

import { askQuestion } from './server-actions';

/**
 * Fetch and render the answers to a question.
 */
export function SearchAskAnswer(props: { spaceId: string; query: string }) {
    const { spaceId, query } = props;

    const [state, setState] = React.useState<{
        type: 'answer';
        answer: SearchAIAnswer | undefined;
    } | null>(null);

    React.useEffect(() => {
        askQuestion(spaceId, query).then(
            ({ answer }) => {
                setState({
                    type: 'answer',
                    answer,
                });
            },
            (error) => {
                // TODO: Handle error by storing a state error
            },
        );
    }, [spaceId, query]);

    return (
        <div>
            {state ? (
                <div>{state.answer ? state.answer.text : 'No answer'}</div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
}
