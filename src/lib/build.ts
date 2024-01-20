/**
 * Get a string representing the build version.
 */
export function buildVersion(): string {
    return process.env.BUILD_VERSION || '0.0.0';
}
