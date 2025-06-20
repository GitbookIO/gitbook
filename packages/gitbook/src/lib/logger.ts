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
