/**
 * Hook to manage a controlled state.
 *
 * From https://github.com/adobe/react-spectrum/blob/main/packages/%40react-stately/utils/src/useControlledState.ts
 */

import React, {
    type SetStateAction,
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';

// Use the earliest effect possible to reset the ref below.
const useEarlyEffect: typeof React.useLayoutEffect =
    typeof document !== 'undefined' ? React.useInsertionEffect || React.useLayoutEffect : () => {};

export function useControlledState<T, C = T>(
    value: Exclude<T, undefined>,
    defaultValue: Exclude<T, undefined> | undefined,
    onChange?: (v: C, ...args: any[]) => void
): [T, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(
    value: Exclude<T, undefined> | undefined,
    defaultValue: Exclude<T, undefined>,
    onChange?: (v: C, ...args: any[]) => void
): [T, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(
    value: T,
    defaultValue: T,
    onChange?: (v: C, ...args: any[]) => void
): [T, (value: SetStateAction<T>, ...args: any[]) => void] {
    // Store the value in both state and a ref. The state value will only be used when uncontrolled.
    // The ref is used to track the most current value, which is passed to the function setState callback.
    const [stateValue, setStateValue] = useState(value || defaultValue);
    const valueRef = useRef(stateValue);

    const isControlledRef = useRef(value !== undefined);
    const isControlled = value !== undefined;
    useEffect(() => {
        const wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled && process.env.NODE_ENV !== 'production') {
            console.warn(
                `WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`
            );
        }
        isControlledRef.current = isControlled;
    }, [isControlled]);

    // After each render, update the ref to the current value.
    // This ensures that the setState callback argument is reset.
    // Note: the effect should not have any dependencies so that controlled values always reset.
    const currentValue = isControlled ? value : stateValue;
    useEarlyEffect(() => {
        valueRef.current = currentValue;
    });

    const [, forceUpdate] = useReducer(() => ({}), {});
    const setValue = useCallback(
        (value: SetStateAction<T>, ...args: any[]) => {
            // @ts-ignore - TS doesn't know that T cannot be a function.
            const newValue = typeof value === 'function' ? value(valueRef.current) : value;
            if (!Object.is(valueRef.current, newValue)) {
                // Update the ref so that the next setState callback has the most recent value.
                valueRef.current = newValue;

                setStateValue(newValue);

                // Always trigger a re-render, even when controlled, so that the layout effect above runs to reset the value.
                forceUpdate();

                // Trigger onChange. Note that if setState is called multiple times in a single event,
                // onChange will be called for each one instead of only once.
                onChange?.(newValue, ...args);
            }
        },
        [onChange]
    );

    return [currentValue, setValue];
}
