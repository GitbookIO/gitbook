import type { BlockProps } from '../Block';
import { getCommentAnchorProps, getCommentMarkerProps } from '../utils';
import { getOpenAPIBlockClientProps } from './context';
import { OpenAPIBlockLazy } from './OpenAPIBlockLazy';
import { resolveOpenAPIOperationBlock } from '@/lib/openapi/resolveOpenAPIOperationBlock';
import type { AnyOpenAPIOperationsBlock } from '@/lib/openapi/types';
import { tcls } from '@/lib/tailwind';

/**
 * Render an openapi block or an openapi-operation block.
 */
export async function OpenAPIOperation(props: BlockProps<AnyOpenAPIOperationsBlock>) {
    const { style, block, context } = props;
    return (
        <div
            {...getCommentAnchorProps(context, block.key)}
            // Its generated headings and descriptions carry keys that aren't page nodes.
            {...getCommentMarkerProps(context, 'data-comment-block')}
            className={tcls('flex w-full min-w-0', style, 'max-w-full')}
        >
            <OpenAPIOperationBody {...props} />
        </div>
    );
}

async function OpenAPIOperationBody(props: BlockProps<AnyOpenAPIOperationsBlock>) {
    const { block, context, style } = props;

    if (!context.contentContext) {
        return null;
    }

    const { data, specUrl, publicURL, error } = await resolveOpenAPIOperationBlock({
        block,
        context: context.contentContext,
    });

    if (error) {
        return (
            <p aria-hidden className={tcls(style)}>
                Error while loading OpenAPI operation — {error.message}
            </p>
        );
    }

    if (!data || !specUrl) {
        return null;
    }

    return (
        <OpenAPIBlockLazy
            variant="operation"
            data={data}
            {...getOpenAPIBlockClientProps({
                props,
                data,
                specUrl: publicURL,
                context: context.contentContext,
                expandAllResponses:
                    data.operation['x-expandAllResponses'] ?? data['x-expandAllResponses'],
                expandAllModelSections:
                    data.operation['x-expandAllModelSections'] ?? data['x-expandAllModelSections'],
                headless: block.type === 'openapi-operation' ? block.data.headless : undefined,
            })}
            className="openapi-block"
        />
    );
}
