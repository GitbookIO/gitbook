import { OpenAPISpec } from '../OpenAPISpec';
import { type OpenAPIContext, getOpenAPIClientContext } from '../context';
import { t } from '../translate';
import type { OpenAPIOperationData, OpenAPIWebhookData } from '../types';
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
                    {t(context.translation, 'deprecated_and_sunset_on', [
                        <span key="date" className="openapi-deprecated-sunset-date">
                            {operation['x-deprecated-sunset']}
                        </span>,
                    ])}
                </div>
            ) : null}
            <OpenAPIOperationDescription operation={operation} context={context} />
            <OpenAPISpec data={data} context={clientContext} />
        </div>
    );
}
