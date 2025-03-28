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
    fn: (span: TraceSpan) => Promise<T>
): Promise<T> {
    const { operation, name: executionName } =
        typeof name === 'string' ? { operation: name, name: undefined } : name;
    const completeName = executionName ? `${operation}(${executionName})` : operation;

    const attributes: Record<string, boolean | string | number> = {};
    const span: TraceSpan = {
        setAttribute(label, value) {
            attributes[label] = value;
        },
    };

    const start = now();
    let failed = false;
    try {
        return await fn(span);
    } catch (error) {
        span.setAttribute('error', true);
        failed = true;
        throw error;
    } finally {
        if (process.env.SILENT !== 'true' && process.env.NODE_ENV !== 'development') {
            const end = now();
            // biome-ignore lint/suspicious/noConsole: we want to log performance data
            console.log(
                `trace ${completeName} ${failed ? 'failed' : 'succeeded'} in ${end - start}ms`,
                attributes
            );
        }
    }
}

/**
 * Return the current time in milliseconds.
 */
export function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
