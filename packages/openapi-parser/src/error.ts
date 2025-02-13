/**
 * Error thrown when the OpenAPI document is invalid.
 */
export class OpenAPIParseError extends Error {
    public override name = 'OpenAPIParseError';

    constructor(
        message: string,
        public readonly url: string,
        public readonly code?: 'invalid-spec' | 'v2-spec' | 'failed-dereference',
    ) {
        super(message);
    }
}
