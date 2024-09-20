'use client';

import * as React from 'react';

export function ServerSelector(props: {
    currentIndex: number;
    onChange: (value: number) => void;
    servers: any[];
}) {
    const { currentIndex, onChange, servers } = props;
    const [index, setIndex] = React.useState(currentIndex);

    React.useEffect(() => {
        onChange(index);
    }, [index]);

    return (
        <span className="inline-flex pl-4 gap-2">
            <input type="hidden" value={`${index}`} name="server" />
            <button
                className="openapi-select-button"
                disabled={index === 0}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIndex((index) => index - 1);
                }}
                type="button"
                aria-label="Previous"
            >
                ◀
            </button>
            <button
                className="openapi-select-button"
                disabled={index >= servers.length - 1}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIndex((index) => index + 1);
                }}
                type="button"
                aria-label="Next"
            >
                ▶
            </button>
        </span>
    );
}
