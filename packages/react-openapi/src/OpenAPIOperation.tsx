import clsx from 'clsx';

import type { OpenAPICustomOperationProperties, OpenAPIV3 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIPath } from './OpenAPIPath';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPISpec } from './OpenAPISpec';
import type { OpenAPIClientContext, OpenAPIContextProps, OpenAPIOperationData } from './types';
import { resolveDescription } from './utils';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { className, data, context } = props;
    const { operation } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
        blockKey: context.blockKey,
    };

    return (
        <div className={clsx('openapi-operation', className)}>
            <div className="openapi-summary" id={operation.summary ? undefined : context.id}>
                {operation.summary
                    ? context.renderHeading({
                          deprecated: operation.deprecated ?? false,
                          title: operation.summary,
                      })
                    : null}
                <OpenAPIPath data={data} context={context} />
                {operation.deprecated && <div className="openapi-deprecated">Deprecated</div>}
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
    context: OpenAPIContextProps;
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
