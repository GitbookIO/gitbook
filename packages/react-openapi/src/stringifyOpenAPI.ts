/**
 * Stringify an OpenAPI object. Same API as JSON.stringify.
 */
export function stringifyOpenAPI(body: unknown, transformer?: null, indent?: number): string {
    return JSON.stringify(
        body,
        (_key, value) => {
            if (value && !Array.isArray(value) && typeof value === 'object') {
                return value;
            }

            return value;
        },
        indent,
    );
}
