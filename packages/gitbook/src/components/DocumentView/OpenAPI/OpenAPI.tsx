import type { JSONDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { OpenAPIOperation } from '@gitbook/react-openapi';

import { type AnyOpenAPIOperationBlock, resolveOpenAPIBlock } from '@/lib/openapi/fetch';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { DocumentView } from '../DocumentView';
import { Heading } from '../Heading';

import './scalar.css';
import './style.css';

/**
 * Render an openapi block or an openapi-operation block.
 */
export async function OpenAPI(props: BlockProps<AnyOpenAPIOperationBlock>) {
    const { style } = props;
    return (
        <div className={tcls('flex w-full', style, 'max-w-full')}>
            <OpenAPIBody {...props} />
        </div>
    );
}

async function OpenAPIBody(props: BlockProps<AnyOpenAPIOperationBlock>) {
    const { block, context } = props;

    if (!context.contentContext) {
        return null;
    }

    const { data, specUrl, error } = await resolveOpenAPIBlock({
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
        <OpenAPIOperation
            data={data}
            context={{
                specUrl,
                icons: {
                    chevronDown: <Icon icon="chevron-down" />,
                    chevronRight: <Icon icon="chevron-right" />,
                    plus: <Icon icon="plus" />,
                },
                renderCodeBlock: (codeProps) => <PlainCodeBlock {...codeProps} />,
                renderDocument: (documentProps) => (
                    <DocumentView
                        document={documentProps.document as JSONDocument}
                        context={props.context}
                        style="space-y-6"
                        blockStyle="max-w-full"
                    />
                ),
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
