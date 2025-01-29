import * as React from 'react';
import classNames from 'classnames';

import { OpenAPIOperationData } from './fetchOpenAPIOperation';
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
        <div className={classNames('openapi-operation', className)}>
            <h2 className="openapi-summary" id={context.id}>
                {operation.summary}
            </h2>
            <div className={classNames('openapi-columns')}>
                <div className={classNames('openapi-column-spec')}>
                    <div className="openapi-intro">
                        {operation.description ? (
                            <Markdown
                                className="openapi-description"
                                source={operation.description}
                            />
                        ) : null}
                    </div>
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
