import { formatOpenAPIMethod } from '@gitbook/react-openapi';

import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Badge displaying the HTTP method of an OpenAPI operation page.
 */
export function OpenAPIMethodBadge(props: { method: string; style?: ClassValue }) {
    const { method, style } = props;
    return (
        <span className={tcls('openapi-method', `openapi-method-${method}`, style)}>
            {formatOpenAPIMethod(method)}
        </span>
    );
}
