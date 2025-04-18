import { resolveOpenAPISchemasBlock } from '@/lib/openapi/resolveOpenAPISchemasBlock';
import { tcls } from '@/lib/tailwind';
import { OpenAPISchemas as BaseOpenAPISchemas } from '@gitbook/react-openapi';

import type { BlockProps } from '../Block';

import './scalar.css';
import './style.css';
import type { OpenAPISchemasBlock } from '@/lib/openapi/types';
import { getOpenAPIContext } from './context';

/**
 * Render an openapi-schemas block.
 */
export async function OpenAPISchemas(props: BlockProps<OpenAPISchemasBlock>) {
    const { style } = props;
    return (
        <div className={tcls('flex w-full', style, 'max-w-full')}>
            <OpenAPISchemasBody {...props} />
        </div>
    );
}

async function OpenAPISchemasBody(props: BlockProps<OpenAPISchemasBlock>) {
    const { block, context } = props;

    if (!context.contentContext) {
        return null;
    }

    const { data, specUrl, error } = await resolveOpenAPISchemasBlock({
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
        <BaseOpenAPISchemas
            schemas={data.schemas}
            grouped={block.data.grouped}
            context={getOpenAPIContext({ props, specUrl, context: context.contentContext })}
            className="openapi-block"
        />
    );
}
