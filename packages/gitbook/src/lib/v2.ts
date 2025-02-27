/**
 * Check if the code is running in v2.
 */
export function isV2() {
    return process.env.GITBOOK_V2 === 'true';
}

/**
 * Assert that the code is not running in v2.
 */
export function assertIsNotV2() {
    if (isV2()) {
        throw new Error('This code is not available in V2');
    }
}
