/**
 * Stringify an OpenAPI object. Same API as JSON.stringify.
 */
export function stringifyOpenAPI(body: unknown, _?: null, indent?: number): string {
    return JSON.stringify(
        body,
        (key, value) => {
            // Ignore internal keys
            if (key.startsWith('x-gitbook-')) {
                return undefined;
            }

            return value;
        },
        indent
    );
}
