import { getLogger } from '@/lib/logger';

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
    let traceError: null | Error = null;
    try {
        return await fn(span);
    } catch (error) {
        span.setAttribute('error', true);
        traceError = error as Error;
        throw error;
    } finally {
        if (process.env.SILENT !== 'true' && process.env.NODE_ENV !== 'development') {
            const end = now();
            const logger = getLogger().subLogger(operation);
            logger.log(
                `trace ${completeName} ${traceError ? `failed with ${traceError.message}` : 'succeeded'} in ${end - start}ms`,
                attributes
            );
        }
    }
}

/**
 * Record a performance trace for the given function, but only log errors.
 * This is useful to not output too much noise in the logs, while still capturing important errors.
 */
export async function traceErrorOnly<T>(
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
    let traceError: null | Error = null;
    try {
        return await fn(span);
    } catch (error) {
        span.setAttribute('error', true);
        traceError = error as Error;
        const logger = getLogger().subLogger(operation);
        logger.error(
            `trace ${completeName} failed with ${traceError.message} in ${now() - start}ms`,
            attributes
        );
        throw error;
    }
}

/**
 * Return the current time in milliseconds.
 */
export function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
