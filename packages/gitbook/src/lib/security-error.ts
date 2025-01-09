/**
 * Test if the error is a security error returned by the browser when cookies or local storage are blocked.
 */
export function checkIsSecurityError(error: unknown): error is Error {
    return (
        error instanceof Error &&
        // Safari
        (error.name === 'SecurityError' ||
            // Firefox
            error.name === 'NS_ERROR_FAILURE' ||
            error.name === 'NS_ERROR_ABORT')
    );
}
