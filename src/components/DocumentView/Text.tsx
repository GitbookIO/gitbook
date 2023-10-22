import React from 'react';

export function Text(props: { text: any }) {
    const { text } = props;

    return (
        <>
            {text.leaves.map((leaf, index) => {
                // TODO: marks
                return <React.Fragment key={index}>{leaf.text}</React.Fragment>;
            })}
        </>
    );
}
