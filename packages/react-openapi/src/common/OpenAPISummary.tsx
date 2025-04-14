import { OpenAPIPath } from '../OpenAPIPath';
import type { OpenAPIContext, OpenAPIOperationData, OpenAPIWebhookData } from '../types';
import { OpenAPIStability } from './OpenAPIStability';

export function OpenAPISummary(props: {
    data: OpenAPIOperationData | OpenAPIWebhookData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;
    const { operation } = data;

    return (
        <div className="openapi-summary" id={operation.summary ? undefined : context.id}>
            {(operation.deprecated || operation['x-stability']) && (
                <div className="openapi-summary-tags">
                    {operation.deprecated && <div className="openapi-deprecated">Deprecated</div>}
                    {operation['x-stability'] && (
                        <OpenAPIStability stability={operation['x-stability']} />
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
            {'path' in data ? <OpenAPIPath data={data} /> : null}
        </div>
    );
}
