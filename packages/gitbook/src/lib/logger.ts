import { cache } from 'react';
import 'server-only';
/**
 * Creates a logger with the given name, the logger will prefix all log messages with the name in square brackets.
 * @param name The name of the logger, which can be used to create a sub-logger.
 * @param requestId An optional request ID to include in log messages for better traceability.
 * @returns A logger object with methods for logging at different levels and creating sub-loggers.
 */
export const createLogger = (name: string, requestId?: string) => {
    return {
        subLogger: (subName: string) => createLogger(`${name}:${subName}`, requestId),
        info: (...data: any[]) =>
            console.info(`[${name}] ${requestId ? `(${requestId})` : ''}`, ...data),
        warn: (...data: any[]) =>
            console.warn(`[${name}] ${requestId ? `(${requestId})` : ''}`, ...data),
        error: (...data: any[]) =>
            console.error(`[${name}] ${requestId ? `(${requestId})` : ''}`, ...data),
        debug: (...data: any[]) =>
            console.debug(`[${name}] ${requestId ? `(${requestId})` : ''}`, ...data),
        log: (...data: any[]) =>
            console.log(`[${name}] ${requestId ? `(${requestId})` : ''}`, ...data),
    };
};

export type GitbookLogger = ReturnType<typeof createLogger>;

export const getLogger = cache(() => {
    // This is not cryptographically secure, but it's fine for logging purposes.
    // It allows us to identify logs from the same request.
    // If we are in the middleware, we don't set a request ID because cache won't work well there.
    const requestId =
        process.env.NEXT_RUNTIME === 'edge'
            ? undefined
            : Math.random().toString(36).substring(2, 15);
    return createLogger('GBOV2', requestId);
});
