/**
 * Format an HTTP method for display in a method badge.
 * Uppercasing is left to the `.openapi-method` CSS.
 */
export function formatOpenAPIMethod(method: string): string {
    switch (method) {
        case 'delete':
            return 'DEL';
        case 'options':
            return 'OPTS';
        default:
            return method;
    }
}
