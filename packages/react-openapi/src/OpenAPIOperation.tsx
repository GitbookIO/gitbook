import * as React from 'react';
import classNames from 'classnames';

import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { Markdown } from './Markdown';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPIServerURL } from './OpenAPIServerURL';
import { OpenAPISpec } from './OpenAPISpec';
import { OpenAPIClientContext, OpenAPIContextProps } from './types';
import { OpenAPIPath } from './OpenAPIPath';

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

    const trimmedDescription = operation.description?.trim();

    return (
        <div className={classNames('openapi-operation', className)}>
            <div className="openapi-summary" id={context.id}>
                <h2 className="openapi-summary-title" data-deprecated={operation.deprecated}>
                    {operation.summary}
                </h2>
                {operation.deprecated && <div className="openapi-deprecated">Deprecated</div>}
            </div>
            <div className={classNames('openapi-columns')}>
                <div className={classNames('openapi-column-spec')}>
                    {operation['x-deprecated-sunset'] ? (
                        <div className="openapi-deprecated-sunset openapi-description openapi-markdown">
                            This operation is deprecated and will be sunset on{' '}
                            <span className="openapi-deprecated-sunset-date">
                                {operation['x-deprecated-sunset']}
                            </span>
                            {`.`}
                        </div>
                    ) : null}
                    {trimmedDescription ? (
                        <div className="openapi-intro">
                            <Markdown className="openapi-description" source={trimmedDescription} />
                        </div>
                    ) : null}
                    <OpenAPIPath data={data} context={context} />
                    <OpenAPISpec data={data} context={clientContext} />
                </div>
                <div className={classNames('openapi-column-preview')}>
                    <div className={classNames('openapi-column-preview-body')}>
                        <OpenAPICodeSample {...props} />
                        <OpenAPIResponseExample {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}
