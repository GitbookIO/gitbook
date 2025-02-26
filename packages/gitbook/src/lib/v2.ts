/**
 * Assert that the code is not running in v2.
 */
export function assertIsNotV2() {
    if (process.env.GITBOOK_V2 === 'true') {
        throw new Error('This code is not available in V2');
    }
}
