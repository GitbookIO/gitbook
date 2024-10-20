import * as React from 'react';
import classNames from 'classnames';
import { ApiClientModalProvider } from '@scalar/api-client-react';

import { OpenAPIOperationData, toJSON } from './fetchOpenAPIOperation';
import { Markdown } from './Markdown';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPIServerURL } from './OpenAPIServerURL';
import { OpenAPISpec } from './OpenAPISpec';
import { OpenAPIClientContext, OpenAPIContextProps } from './types';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { className, data, context } = props;
    const { operation, servers, method, path } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
        blockKey: context.blockKey,
    };

    return (
        <ApiClientModalProvider
            configuration={{ spec: { url: context.specUrl } }}
            initialRequest={{ path: data.path, method: data.method }}
        >
            <div className={classNames('openapi-operation', className)}>
                <div className="openapi-intro">
                    <h2 className="openapi-summary" id={context.id}>
                        {operation.summary}
                    </h2>
                    {operation.description ? (
                        <Markdown className="openapi-description" source={operation.description} />
                    ) : null}
                    <div className="openapi-target">
                        <span
                            className={classNames(
                                'openapi-method',
                                `openapi-method-${method.toLowerCase()}`,
                            )}
                        >
                            {method.toUpperCase()}
                        </span>
                        <span className="openapi-url">
                            <OpenAPIServerURL servers={servers} />
                            {path}
                        </span>
                    </div>
                </div>
                <div className={classNames('openapi-columns')}>
                    <div className={classNames('openapi-column-spec')}>
                        <OpenAPISpec rawData={toJSON(data)} context={clientContext} />
                    </div>
                    <div className={classNames('openapi-column-preview')}>
                        <div className={classNames('openapi-column-preview-body')}>
                            <OpenAPICodeSample {...props} />
                            <OpenAPIResponseExample {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </ApiClientModalProvider>
    );
}
