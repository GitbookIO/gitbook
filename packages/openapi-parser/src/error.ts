type OpenAPIParseErrorCode =
    | 'invalid'
    | 'parse-v2-in-v3'
    | 'v2-conversion'
    | 'dereference'
    | 'yaml-parse';

/**
 * Error thrown when the OpenAPI document is invalid.
 */
export class OpenAPIParseError extends Error {
    public override name = 'OpenAPIParseError';
    public code: OpenAPIParseErrorCode;
    public rootURL: string | null;

    constructor(
        message: string,
        options: {
            code: OpenAPIParseErrorCode;
            rootURL?: string | null;
            cause?: Error;
        }
    ) {
        super(message, { cause: options.cause });
        this.code = options.code;
        this.rootURL = options.rootURL ?? null;
    }
}
