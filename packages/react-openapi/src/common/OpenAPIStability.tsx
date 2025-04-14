import type { OpenAPIStability } from '@gitbook/openapi-parser';

const stabilityEnum = {
    experimental: 'Experimental',
    alpha: 'Alpha',
    beta: 'Beta',
} as const;

export function OpenAPIStability(props: { stability: OpenAPIStability }) {
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
