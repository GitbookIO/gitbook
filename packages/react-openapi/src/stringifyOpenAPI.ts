import { SYMBOL_MARKDOWN_PARSED, SYMBOL_REF_RESOLVED } from './resolveOpenAPIPath';

/**
 * Stringify an OpenAPI object. Same API as JSON.stringify.
 */
export function stringifyOpenAPI(body: unknown, transformer?: null, indent?: number): string {
    return JSON.stringify(
        body,
        (_key, value) => {
            if (value && !Array.isArray(value) && typeof value === 'object') {
                // Extract out internal keys used in parsing
                const { [SYMBOL_MARKDOWN_PARSED]: _, [SYMBOL_REF_RESOLVED]: __, ...rest } = value;
                return rest;
            }

            return value;
        },
        indent,
    );
}
