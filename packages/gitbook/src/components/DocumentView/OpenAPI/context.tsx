import { Icon } from '@gitbook/icons';
import type { OpenAPIContext } from '@gitbook/react-openapi';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { DocumentView } from '../DocumentView';
import { Heading } from '../Heading';

import './scalar.css';
import './style.css';
import type { AnyOpenAPIOperationsBlock, OpenAPISchemasBlock } from '@/lib/openapi/types';
import type { SlimJSONDocument } from '@/lib/slim-document';

/**
 * Get the OpenAPI context to render a block.
 */
export function getOpenAPIContext(args: {
    props: BlockProps<AnyOpenAPIOperationsBlock | OpenAPISchemasBlock>;
    specUrl: string;
}): OpenAPIContext {
    const { props, specUrl } = args;
    const { block } = props;
    return {
        specUrl,
        icons: {
            chevronDown: <Icon icon="chevron-down" />,
            chevronRight: <Icon icon="chevron-right" />,
            plus: <Icon icon="plus" />,
        },
        renderCodeBlock: (codeProps) => <PlainCodeBlock {...codeProps} />,
        renderDocument: (documentProps) => (
            <DocumentView
                document={documentProps.document as SlimJSONDocument}
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
                style={tcls([
                    headingProps.deprecated ? 'line-through' : undefined,
                    headingProps.deprecated || !!headingProps.stability
                        ? '[&>div]:mt-0'
                        : undefined,
                ])}
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
                            leaves: [{ text: headingProps.title, object: 'leaf', marks: [] }],
                        },
                    ],
                }}
            />
        ),
        defaultInteractiveOpened: props.context.mode === 'print',
        id: block.meta?.id,
        blockKey: block.key,
    };
}
