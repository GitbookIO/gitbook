import { DocumentBlockSwagger } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { OpenAPIOperation } from '@gitbook/react-openapi';
import React from 'react';

import { LoadingPane } from '@/components/primitives';
import { fetchOpenAPIBlock } from '@/lib/openapi';
import { tcls } from '@/lib/tailwind';

import OpenAPIContext from './OpenAPIContext';
import { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';

import './style.css';
import './scalar.css';

/**
 * Render an OpenAPI block.
 */
export async function OpenAPI(props: BlockProps<DocumentBlockSwagger>) {
    const { block, style } = props;
    return (
        <div className={tcls('w-full', 'flex', 'flex-row', style, 'max-w-full')}>
            <React.Suspense fallback={<OpenAPIFallback />}>
                <OpenAPIBody {...props} />
            </React.Suspense>
        </div>
    );
}

async function OpenAPIBody(props: BlockProps<DocumentBlockSwagger>) {
    const { block, context } = props;
    const { data, error } = await fetchOpenAPIBlock(block, context.resolveContentRef);

    if (error) {
        return (
            <div className={tcls('hidden')}>
                <p>
                    Error with {error.url}: {error.message}
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <OpenAPIContext block={block} data={data}>
            <OpenAPIOperation
                data={data}
                context={{
                    icons: {
                        chevronDown: <Icon icon="chevron-down" />,
                        chevronRight: <Icon icon="chevron-right" />,
                    },
                    CodeBlock: PlainCodeBlock,
                    defaultInteractiveOpened: context.mode === 'print',
                    id: block.meta?.id,
                    blockKey: block.key
                }}
                className="openapi-block"
            />
         </OpenAPIContext>
    );
}

function OpenAPIFallback() {
    return (
        <div
            role="status"
            aria-busy
            className={'openapi-block ' + tcls('flex', 'flex-1', 'flex-col', 'gap-3')}
        >
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
