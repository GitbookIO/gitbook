import * as Sentry from '@sentry/nextjs';

export interface TraceSpan {
    setAttribute: (label: string, value: boolean | string | number) => void;
}

interface TraceName {
    /** Non-unique name for the operation */
    operation: string;
    /** Potentially unique name for the excution of the operation */
    name?: string;
}

/**
 * Record a performance trace for the given function.
 */
export async function trace<T>(
    name: string | TraceName,
    fn: (span: TraceSpan) => Promise<T>,
): Promise<T> {
    const { operation, name: executionName } =
        typeof name === 'string' ? { operation: name, name: undefined } : name;
    const completeName = executionName ? `${operation}(${executionName})` : operation;

    return await Sentry.startSpan(
        {
            name: completeName,
            op: operation,
        },
        async (sentrySpan) => {
            const attributes: Record<string, boolean | string | number> = {};
            const span: TraceSpan = {
                setAttribute(label, value) {
                    attributes[label] = value;
                    sentrySpan?.setAttribute(label, value);
                },
            };

            let start = now();
            try {
                return await fn(span);
            } catch (error) {
                span.setAttribute('error', true);
                throw error;
            } finally {
                let end = now();
                console.log(`trace ${completeName} ${end - start}ms`, attributes);
            }
        },
    );
}

/**
 * Return the current time in milliseconds.
 */
export function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
