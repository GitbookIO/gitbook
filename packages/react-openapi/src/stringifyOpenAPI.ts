/**
 * Stringify an OpenAPI object. Same API as JSON.stringify.
 */
export function stringifyOpenAPI(
    value: any,
    replacer?: ((this: any, key: string, value: any) => any) | null,
    space?: string | number
): string {
    return JSON.stringify(
        value,
        (key, value) => {
            // Ignore internal keys
            if (key.startsWith('x-gitbook-')) {
                return undefined;
            }

            if (replacer) {
                return replacer(key, value);
            }

            return value;
        },
        space
    );
}
