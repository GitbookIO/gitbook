import { resolveOpenAPISchemasBlock } from '@/lib/openapi/resolveOpenAPISchemasBlock';
import { tcls } from '@/lib/tailwind';

import type { OpenAPISchemasBlock } from '@/lib/openapi/types';
import type { BlockProps } from '../Block';
import { OpenAPIBlockLazy } from './OpenAPIBlockLazy';
import { getOpenAPIBlockClientProps } from './context';

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

    const { data, specUrl, publicURL, error } = await resolveOpenAPISchemasBlock({
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
        <OpenAPIBlockLazy
            variant="schemas"
            data={data}
            grouped={block.data.grouped}
            {...getOpenAPIBlockClientProps({
                props,
                specUrl: publicURL,
                context: context.contentContext,
                expandAllModelSections: data['x-expandAllModelSections'],
            })}
            className="openapi-block"
        />
    );
}
