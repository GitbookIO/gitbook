import type { OpenAPIStability as OpenAPIStabilityType } from '@gitbook/openapi-parser';

const stabilityEnum: Record<OpenAPIStabilityType, string> = {
    experimental: 'Experimental',
    alpha: 'Alpha',
    beta: 'Beta',
} as const;

export function OpenAPIStability(props: { stability: OpenAPIStabilityType }) {
    const { stability } = props;

    const foundStability = stabilityEnum[stability];

    if (!foundStability) {
        return null;
    }

    return (
        <div className={`openapi-stability openapi-stability-${foundStability.toLowerCase()}`}>
            {foundStability}
        </div>
    );
}
