import clsx from 'clsx';
import { OpenAPIExample, getExampleFromSchema } from './OpenAPIExample';
import { OpenAPIColumnSpec } from './common/OpenAPIColumnSpec';
import { OpenAPISummary } from './common/OpenAPISummary';
import type { OpenAPIContext, OpenAPIWebhookData } from './types';

/**
 * Display an interactive OpenAPI webhook.
 */
export function OpenAPIWebhook(props: {
    className?: string;
    data: OpenAPIWebhookData;
    context: OpenAPIContext;
}) {
    const { className, data, context } = props;
    const { operation } = data;

    return (
        <div className={clsx('openapi-webhook', className)}>
            <OpenAPISummary data={data} context={context} />
            <div className="openapi-columns">
                <OpenAPIColumnSpec data={data} context={context} />
                <div className="openapi-column-preview">
                    <div className="openapi-column-preview-body">
                        <div className="openapi-panel">
                            <h4 className="openapi-panel-heading">Payload</h4>
                            <div className="openapi-panel-body">
                                <OpenAPIExample
                                    example={getExampleFromSchema({
                                        schema: operation.schema,
                                    })}
                                    context={context}
                                    syntax="json"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
