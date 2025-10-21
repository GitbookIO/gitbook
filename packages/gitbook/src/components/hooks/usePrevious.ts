import * as React from 'react';

/**
 * Returns the value of the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = React.useRef<T | undefined>(undefined);
    React.useLayoutEffect(() => {
        ref.current = value;
    });
    return ref.current;
}
