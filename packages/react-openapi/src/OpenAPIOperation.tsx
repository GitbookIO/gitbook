import clsx from 'clsx';

import type {
    OpenAPICustomOperationProperties,
    OpenAPIStability,
    OpenAPIV3,
} from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIPath } from './OpenAPIPath';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPISpec } from './OpenAPISpec';
import { getOpenAPIClientContext } from './context';
import type { OpenAPIContext, OpenAPIOperationData } from './types';
import { resolveDescription } from './utils';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContext;
}) {
    const { className, data, context } = props;
    const { operation } = data;

    const clientContext = getOpenAPIClientContext(context);

    return (
        <div className={clsx('openapi-operation', className)}>
            <div className="openapi-summary" id={operation.summary ? undefined : context.id}>
                {(operation.deprecated || operation['x-stability']) && (
                    <div className="openapi-summary-tags">
                        {operation.deprecated && (
                            <div className="openapi-deprecated">Deprecated</div>
                        )}
                        {operation['x-stability'] && (
                            <OpenAPIOperationStability stability={operation['x-stability']} />
                        )}
                    </div>
                )}
                {operation.summary
                    ? context.renderHeading({
                          deprecated: operation.deprecated ?? false,
                          stability: operation['x-stability'],
                          title: operation.summary,
                      })
                    : null}
                <OpenAPIPath data={data} context={context} />
            </div>
            <div className="openapi-columns">
                <div className="openapi-column-spec">
                    {operation['x-deprecated-sunset'] ? (
                        <div className="openapi-deprecated-sunset openapi-description openapi-markdown">
                            This operation is deprecated and will be sunset on{' '}
                            <span className="openapi-deprecated-sunset-date">
                                {operation['x-deprecated-sunset']}
                            </span>
                            {'.'}
                        </div>
                    ) : null}
                    <OpenAPIOperationDescription operation={operation} context={context} />
                    <OpenAPISpec data={data} context={clientContext} />
                </div>
                <div className="openapi-column-preview">
                    <div className="openapi-column-preview-body">
                        <OpenAPICodeSample {...props} />
                        <OpenAPIResponseExample {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpenAPIOperationDescription(props: {
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;
    context: OpenAPIContext;
}) {
    const { operation } = props;
    if (operation['x-gitbook-description-document']) {
        return (
            <div className="openapi-intro">
                {props.context.renderDocument({
                    document: operation['x-gitbook-description-document'],
                })}
            </div>
        );
    }

    const description = resolveDescription(operation);
    if (!description) {
        return null;
    }

    return (
        <div className="openapi-intro">
            <Markdown className="openapi-description" source={description} />
        </div>
    );
}

const stabilityEnum = {
    experimental: 'Experimental',
    alpha: 'Alpha',
    beta: 'Beta',
} as const;

function OpenAPIOperationStability(props: { stability: OpenAPIStability }) {
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
