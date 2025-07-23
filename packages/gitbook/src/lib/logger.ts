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
    // The tail worker used for extracting the labels expect this format.
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

const getRequestId = (fallbackRequestId?: string) => {
    // We are in OpenNext and we should have access to the request ID.
    if ((globalThis as any).__openNextAls) {
        return (globalThis as any).__openNextAls.getStore()?.requestId;
    }
    return fallbackRequestId;
};

export const getLogger =
    process.env.NEXT_RUNTIME === 'edge'
        ? () => createLogger('GBOV2', { requestId: getRequestId() })
        : () =>
              createLogger('GBOV2', {
                  requestId: getRequestId(Math.random().toString(36).substring(2, 15)),
              });
