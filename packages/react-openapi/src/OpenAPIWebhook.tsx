import clsx from 'clsx';
import { OpenAPIWebhookExample } from './OpenAPIWebhookExample';
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
