export class OpenAPIParseError extends Error {
    public name = 'OpenAPIParseError';

    constructor(
        message: string,
        public readonly url: string,
        public readonly code?: 'invalid-spec' | 'v2-spec',
    ) {
        super(message);
    }
}
