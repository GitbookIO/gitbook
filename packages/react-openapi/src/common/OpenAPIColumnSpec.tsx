import { OpenAPISpec } from '../OpenAPISpec';
import { getOpenAPIClientContext } from '../context';
import type { OpenAPIContext, OpenAPIOperationData, OpenAPIWebhookData } from '../types';
import { OpenAPIOperationDescription } from './OpenAPIOperationDescription';

export function OpenAPIColumnSpec(props: {
    data: OpenAPIOperationData | OpenAPIWebhookData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;
    const { operation } = data;

    const clientContext = getOpenAPIClientContext(context);

    return (
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
    );
}
