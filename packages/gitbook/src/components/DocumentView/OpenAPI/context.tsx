import type { JSONDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { type OpenAPIContextInput, checkIsValidLocale } from '@gitbook/react-openapi';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { DocumentView } from '../DocumentView';
import { Heading } from '../Heading';

import './scalar.css';
import './style.css';
import { DEFAULT_LOCALE, getSpaceLocale } from '@/intl/server';
import type { GitBookAnyContext } from '@/lib/context';
import type {
    AnyOpenAPIOperationsBlock,
    OpenAPISchemasBlock,
    OpenAPIWebhookBlock,
} from '@/lib/openapi/types';

/**
 * Get the OpenAPI context to render a block.
 */
export function getOpenAPIContext(args: {
    props: BlockProps<AnyOpenAPIOperationsBlock | OpenAPISchemasBlock | OpenAPIWebhookBlock>;
    specUrl: string;
    context: GitBookAnyContext | undefined;
}): OpenAPIContextInput {
    const { props, specUrl, context } = args;
    const { block } = props;

    const customizationLocale = context ? getSpaceLocale(context) : DEFAULT_LOCALE;
    const locale = checkIsValidLocale(customizationLocale) ? customizationLocale : DEFAULT_LOCALE;

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
                style={tcls([
                    headingProps.deprecated ? 'line-through' : undefined,
                    headingProps.deprecated || !!headingProps.stability
                        ? '[&>div]:pt-0'
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
        locale,
    };
}
