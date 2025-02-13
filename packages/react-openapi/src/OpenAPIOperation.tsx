import clsx from 'clsx';

import type { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { Markdown } from './Markdown';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPISpec } from './OpenAPISpec';
import { OpenAPIClientContext, type OpenAPIContextProps } from './types';
import { OpenAPIPath } from './OpenAPIPath';
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

    const description = resolveDescription(operation)?.trim();

    return (
        <div className={clsx('openapi-operation', className)}>
            <div className="openapi-summary" id={context.id}>
                <h2 className="openapi-summary-title" data-deprecated={operation.deprecated}>
                    {operation.summary}
                </h2>
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
                            {`.`}
                        </div>
                    ) : null}
                    {description ? (
                        <div className="openapi-intro">
                            <Markdown className="openapi-description" source={description} />
                        </div>
                    ) : null}
                    <OpenAPIPath data={data} context={context} />
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
