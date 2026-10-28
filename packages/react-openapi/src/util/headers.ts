/**
 * Merges two header objects, removing duplicate headers case-insensitively.
 * Headers from the second object take precedence over headers from the first object.
 */
export function mergeHeaders(
    baseHeaders: Record<string, string>,
    overrideHeaders: Record<string, string>
): Record<string, string> {
    const overrideKeysLower = new Set(Object.keys(overrideHeaders).map((key) => key.toLowerCase()));
    const filteredBaseHeaders = Object.fromEntries(
        Object.entries(baseHeaders).filter(([key]) => !overrideKeysLower.has(key.toLowerCase()))
    );

    return {
        ...filteredBaseHeaders,
        ...overrideHeaders,
    };
}
