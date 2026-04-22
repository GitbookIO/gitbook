/**
 * Creates a mid-stream error handler that gracefully downgrades errors to values
 * when the stream has already started delivering content.
 *
 * - If the stream has started: calls `update(onError(error, lastValue))` (when non-null)
 *   then `done()`, preserving partial content on the client.
 * - If the stream has not started: calls `fail(error)`, propagating the error normally
 *   so the client receives a full error state.
 */
export function createMidStreamErrorHandler<T>(
    onError: (error: unknown, lastValue: T | undefined) => T | undefined
): {
    track: (value: T) => void;
    handleError: (
        error: unknown,
        callbacks: {
            update: (value: T) => void;
            done: () => void;
            fail: (error: unknown) => void;
        }
    ) => void;
} {
    let hasStarted = false;
    let lastValue: T | undefined;

    return {
        track(value) {
            hasStarted = true;
            lastValue = value;
        },
        handleError(error, { update, done, fail }) {
            if (hasStarted) {
                const errorValue = onError(error, lastValue);
                if (errorValue !== undefined) {
                    update(errorValue);
                }
                done();
            } else {
                fail(error);
            }
        },
    };
}
