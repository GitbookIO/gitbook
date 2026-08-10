import clsx from 'classnames';
import { formatOpenAPIMethod } from './formatOpenAPIMethod';

/**
 * Badge displaying the HTTP method of an OpenAPI operation.
 */
export function OpenAPIMethodBadge(props: {
    method: string;
    /** Abbreviate the label (DEL, OPTS) instead of the full method. */
    short?: boolean;
    size?: 'small' | 'medium';
    className?: string;
}) {
    const { method, short = false, size = 'medium', className } = props;
    const normalized = method.toLowerCase();
    return (
        <span
            className={clsx(
                'openapi-method',
                `openapi-method-${normalized}`,
                `openapi-method-${size}`,
                className
            )}
        >
            {short ? formatOpenAPIMethod(normalized) : method}
        </span>
    );
}
