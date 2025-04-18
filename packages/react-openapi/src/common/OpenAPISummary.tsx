import { OpenAPIPath } from '../OpenAPIPath';
import type { OpenAPIContext } from '../context';
import type { OpenAPIOperationData, OpenAPIWebhookData } from '../types';
import { OpenAPIStability } from './OpenAPIStability';

export function OpenAPISummary(props: {
    data: OpenAPIOperationData | OpenAPIWebhookData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;
    const { operation } = data;

    const title = (() => {
        if (operation.summary) {
            return operation.summary;
        }

        if ('name' in data) {
            return data.name;
        }

        return undefined;
    })();

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
            {title
                ? context.renderHeading({
                      deprecated: operation.deprecated ?? false,
                      stability: operation['x-stability'],
                      title,
                  })
                : null}
            {'path' in data ? <OpenAPIPath data={data} context={context} /> : null}
        </div>
    );
}
