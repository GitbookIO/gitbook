/**
 * Stringify an OpenAPI object. Same API as JSON.stringify.
 */
export function stringifyOpenAPI(body: unknown, _?: null, indent?: number): string {
    return JSON.stringify(
        body,
        (key, value) => {
            // Ignore internal keys
            if (SYMBOL_GITBOOK_INTERNAL.test(key)) {
                return undefined;
            }

            return value;
        },
        indent,
    );
}

// Match all x-gitbook-* symbols
export const SYMBOL_GITBOOK_INTERNAL = /x-gitbook-.*/;
