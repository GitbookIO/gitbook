import { ChevronDown, ChevronRight } from '@geist-ui/icons';
import { DocumentBlockSwagger } from '@gitbook/api';
import { OpenAPIOperation } from '@gitbook/react-openapi';
import React from 'react';

import { LoadingPane } from '@/components/primitives';
import { fetchOpenAPIBlock } from '@/lib/openapi';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';

import './style.css';

/**
 * Render an OpenAPI block.
 */
export async function OpenAPI(props: BlockProps<DocumentBlockSwagger>) {
    const { block, style } = props;
    return (
        <div className={tcls('w-full', 'flex', 'flex-row', style, 'max-w-full')}>
            {/*
                Invisible span with the ID to correctly identify the active section in the aside navigation.
                We don't use the full <div> because it can be longer than the viewport and will not work well with IntersectionObserver.
            */}
            <span id={block.meta?.id} />
            <React.Suspense fallback={<OpenAPIFallback />}>
                <OpenAPIBody {...props} />
            </React.Suspense>
        </div>
    );
}

async function OpenAPIBody(props: BlockProps<DocumentBlockSwagger>) {
    const { block, context } = props;
    const data = await fetchOpenAPIBlock(block, context.resolveContentRef);

    if (!data) {
        return null;
    }

    return (
        <OpenAPIOperation
            data={data}
            context={{
                icons: {
                    chevronDown: <ChevronDown />,
                    chevronRight: <ChevronRight />,
                },
                CodeBlock: PlainCodeBlock,
            }}
        />
    );
}

function OpenAPIFallback() {
    return (
        <div role="status" aria-busy className={tcls('flex', 'flex-1', 'flex-col', 'gap-3')}>
            <LoadingPane
                tile={12}
                style={['rounded-md', 'h-[47px]', '[max-width:calc(48rem-1px)]']}
            />
            <LoadingPane
                tile={12}
                style={['rounded-md', 'h-[35px]', '[max-width:calc(48rem-1px)]']}
            />
            <div className={tcls('flex', 'gap-[25px]')}>
                <div className={tcls('flex', 'flex-1', 'flex-col', 'gap-3')}>
                    <LoadingPane tile={24} style={['rounded-md', 'aspect-[2.5/1]', 'w-full']} />
                    <LoadingPane tile={24} style={['rounded-md', 'aspect-[2.5/1]', 'w-full']} />
                </div>
                <div className={tcls('flex', 'flex-1', 'flex-col', 'gap-3')}>
                    <LoadingPane tile={24} style={['rounded-md', 'aspect-[4/1]', 'w-full']} />
                    <LoadingPane tile={24} style={['rounded-md', 'aspect-[4/1]', 'w-full']} />
                </div>
            </div>
        </div>
    );
}
