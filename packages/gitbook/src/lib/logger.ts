import { cache } from 'react';
export type LogLabelValue = string | number | undefined | boolean;

export type LogLabels = { [key: string]: LogLabelValue };

export type SubLoggerOptions = {
    labels?: LogLabels;
};

export type LoggerOptions = SubLoggerOptions & {
    requestId?: string;
};

const formatPrefix = (name: string, options: LoggerOptions) => {
    const { labels } = options;
    return `%${JSON.stringify(labels ?? {})}%[${name}]`;
};

/**
 * Creates a logger with the given name, the logger will prefix all log messages with the name in square brackets.
 * By default it will include a `requestId` label, and output labels in the log messages.
 * Format of log messages will be:
 * `%{"label1":"value1","label2":"value2"}%[loggerName] message...`
 * @param name The name of the logger, which can be used to create a sub-logger.
 * @param requestId An optional request ID to include in log messages for better traceability.
 * @returns A logger object with methods for logging at different levels and creating sub-loggers.
 */
export const createLogger = (name: string, options: LoggerOptions) => {
    const { requestId, labels } = options;
    const finalOptions = { requestId, labels: { ...labels, requestId } };
    return {
        subLogger: (subName: string, options?: SubLoggerOptions) =>
            createLogger(`${name}:${subName}`, {
                requestId,
                labels: { ...labels, ...(options?.labels ?? {}) },
            }),
        info: (...data: any[]) => console.info(formatPrefix(name, finalOptions), ...data),
        warn: (...data: any[]) => console.warn(formatPrefix(name, finalOptions), ...data),
        error: (...data: any[]) => console.error(formatPrefix(name, finalOptions), ...data),
        debug: (...data: any[]) => console.debug(formatPrefix(name, finalOptions), ...data),
        log: (...data: any[]) => console.log(formatPrefix(name, finalOptions), ...data),
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
    return createLogger('GBOV2', { requestId });
});
