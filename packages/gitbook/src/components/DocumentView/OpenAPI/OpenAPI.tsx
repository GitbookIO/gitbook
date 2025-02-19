import { DocumentBlockOpenAPI } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { OpenAPIOperation } from '@gitbook/react-openapi';
import React from 'react';

import { fetchOpenAPIBlock } from '@/lib/openapi/fetch';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { Heading } from '../Heading';

import './style.css';
import './scalar.css';

/**
 * Render an OpenAPI block.
 */
export async function OpenAPI(props: BlockProps<DocumentBlockOpenAPI>) {
    const { style } = props;
    return (
        <div className={tcls('w-full', 'flex', 'flex-row', style, 'max-w-full')}>
            <OpenAPIBody {...props} />
        </div>
    );
}

async function OpenAPIBody(props: BlockProps<DocumentBlockOpenAPI>) {
    const { block, context } = props;
    const { data, specUrl, error } = await fetchOpenAPIBlock(block, context.resolveContentRef);

    if (error) {
        return (
            <div className={tcls('hidden')}>
                <p>
                    Error with {error.rootURL}: {error.message}
                </p>
            </div>
        );
    }

    if (!data || !specUrl) {
        return null;
    }

    return (
        <OpenAPIOperation
            data={data}
            context={{
                specUrl,
                icons: {
                    chevronDown: <Icon icon="chevron-down" />,
                    chevronRight: <Icon icon="chevron-right" />,
                    plus: <Icon icon="plus" />,
                },
                CodeBlock: PlainCodeBlock,
                renderHeading: (headingProps) => (
                    <Heading
                        document={props.document}
                        ancestorBlocks={props.ancestorBlocks}
                        isEstimatedOffscreen={props.isEstimatedOffscreen}
                        context={props.context}
                        style={headingProps.deprecated ? 'line-through' : undefined}
                        block={{
                            object: 'block',
                            key: `${block.key}-heading`,
                            meta: block.meta,
                            data: {},
                            type: 'heading-2',
                            nodes: [
                                {
                                    key: `${block.key}-heading-text`,
                                    object: 'text',
                                    leaves: [
                                        { text: headingProps.title, object: 'leaf', marks: [] },
                                    ],
                                },
                            ],
                        }}
                    />
                ),
                defaultInteractiveOpened: context.mode === 'print',
                id: block.meta?.id,
                blockKey: block.key,
            }}
            className="openapi-block"
        />
    );
}
