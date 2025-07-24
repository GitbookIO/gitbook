import type { ErrorObject } from '@scalar/openapi-parser';

export type OpenAPIParseErrorCode =
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
    public errors: ErrorObject[] | undefined;
    constructor(
        message: string,
        options: {
            code: OpenAPIParseErrorCode;
            rootURL?: string | null;
            cause?: Error;
            errors?: ErrorObject[] | undefined;
        }
    ) {
        super(message, { cause: options.cause });
        this.code = options.code;
        this.rootURL = options.rootURL ?? null;
        this.errors = options.errors;
    }
}
