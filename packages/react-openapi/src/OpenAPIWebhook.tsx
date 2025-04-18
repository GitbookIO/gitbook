import clsx from 'clsx';
import { OpenAPIWebhookExample } from './OpenAPIWebhookExample';
import { OpenAPIColumnSpec } from './common/OpenAPIColumnSpec';
import { OpenAPISummary } from './common/OpenAPISummary';
import { type OpenAPIContextInput, resolveOpenAPIContext } from './context';
import type { OpenAPIWebhookData } from './types';

/**
 * Display an interactive OpenAPI webhook.
 */
export function OpenAPIWebhook(props: {
    className?: string;
    data: OpenAPIWebhookData;
    context: OpenAPIContextInput;
}) {
    const { className, data, context: contextInput } = props;

    const context = resolveOpenAPIContext(contextInput);

    return (
        <div className={clsx('openapi-webhook', className)}>
            <OpenAPISummary data={data} context={context} />
            <div className="openapi-columns">
                <OpenAPIColumnSpec data={data} context={context} />
                <div className="openapi-column-preview">
                    <div className="openapi-column-preview-body">
                        <OpenAPIWebhookExample data={data} context={context} />
                    </div>
                </div>
            </div>
        </div>
    );
}
