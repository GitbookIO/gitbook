import classNames from 'classnames';

import { OpenAPIOperationData, toJSON } from './fetchOpenAPIOperation';
import { OpenAPIServerURL } from './OpenAPIServerURL';
import { OpenAPIClientContext, OpenAPIContextProps } from './types';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPISpec } from './OpenAPISpec';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { Markdown } from './Markdown';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;
    const { operation, servers, method, path } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
    };

    return (
        <div className={classNames('openapi-operation')}>
            <div className="openapi-intro">
                <h2 className="openapi-summary">{operation.summary}</h2>
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
    );
}
