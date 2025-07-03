import { OpenAPIOperation as BaseOpenAPIOperation } from '@gitbook/react-openapi';

import { resolveOpenAPIOperationBlock } from '@/lib/openapi/resolveOpenAPIOperationBlock';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';

import './scalar.css';
import './style.css';
import type { AnyOpenAPIOperationsBlock } from '@/lib/openapi/types';
import { getOpenAPIContext } from './context';

/**
 * Render an openapi block or an openapi-operation block.
 */
export async function OpenAPIOperation(props: BlockProps<AnyOpenAPIOperationsBlock>) {
    const { style } = props;
    return (
        <div className={tcls('flex w-full min-w-0', style, 'max-w-full')}>
            <OpenAPIOperationBody {...props} />
        </div>
    );
}

async function OpenAPIOperationBody(props: BlockProps<AnyOpenAPIOperationsBlock>) {
    const { block, context, style } = props;

    if (!context.contentContext) {
        return null;
    }

    const { data, specUrl, error } = await resolveOpenAPIOperationBlock({
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
        <BaseOpenAPIOperation
            data={data}
            context={getOpenAPIContext({ props, specUrl, context: context.contentContext })}
            className="openapi-block"
        />
    );
}
