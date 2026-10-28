import type { Position, Token } from 'acorn';

export class ExpressionError extends Error {
    /**
     * The location of the error in the parsed expression.
     */
    public location?: Position | null;

    /**
     * The expression token with the error
     */
    public token?: Token;

    constructor(message: string, loc?: Position | null, token?: Token) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ExpressionError);
        }
        this.name = 'ExpressionError';
        this.location = loc;
        this.token = token;
    }
}
