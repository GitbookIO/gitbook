import type { OpenAPIStability } from '@gitbook/openapi-parser';
import type { OpenAPIContext } from './context';
import { t } from './translate';

/**
 * Display the stability of an OpenAPI operation.
 */
export function OpenAPIOperationStability(props: {
    stability: OpenAPIStability;
    context: OpenAPIContext;
}) {
    const { stability, context } = props;

    const stabilityLabel = getStabilityLabel(stability, context);

    if (!stabilityLabel) {
        return null;
    }

    return (
        <div className={`openapi-stability openapi-stability-${stability}`}>{stabilityLabel}</div>
    );
}

/**
 * Get the stability label for the given stability level.
 */
function getStabilityLabel(stability: OpenAPIStability, context: OpenAPIContext) {
    switch (stability) {
        case 'experimental':
            return t(context.translation, 'stability_experimental');
        case 'alpha':
            return t(context.translation, 'stability_alpha');
        case 'beta':
            return t(context.translation, 'stability_beta');
        default:
            return null;
    }
}
