import { OpenAPIWebhook as BaseOpenAPIWebhook } from '@gitbook/react-openapi';

import { resolveOpenAPIWebhookBlock } from '@/lib/openapi/resolveOpenAPIWebhookBlock';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';

import './scalar.css';
import './style.css';
import type { OpenAPIWebhookBlock } from '@/lib/openapi/types';
import { getOpenAPIContext } from './context';

/**
 * Render an openapi block or an openapi-webhook block.
 */
export async function OpenAPIWebhook(props: BlockProps<OpenAPIWebhookBlock>) {
    const { style } = props;
    return (
        <div className={tcls('flex w-full min-w-0', style, 'max-w-full')}>
            <OpenAPIWebhookBody {...props} />
        </div>
    );
}

async function OpenAPIWebhookBody(props: BlockProps<OpenAPIWebhookBlock>) {
    const { block, context } = props;

    if (!context.contentContext) {
        return null;
    }

    const { data, specUrl, error } = await resolveOpenAPIWebhookBlock({
        block,
        context: context.contentContext,
    });

    if (error) {
        return (
            <div className="hidden">
                <p>
                    Error with {specUrl}: {error.message}
                </p>
            </div>
        );
    }

    if (!data || !specUrl) {
        return null;
    }

    return (
        <BaseOpenAPIWebhook
            data={data}
            context={getOpenAPIContext({ props, specUrl, context: context.contentContext })}
            className="openapi-block"
        />
    );
}
