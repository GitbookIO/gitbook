import type { JSONDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { type OpenAPIContextInput, checkIsValidLocale } from '@gitbook/react-openapi';

import type { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { DocumentView } from '../DocumentView';
import { Heading } from '../Heading';

import './style.css';
import { DEFAULT_LOCALE, getSpaceLocale } from '@/intl/server';
import type { GitBookAnyContext } from '@/lib/context';
import { buildSignedProxyUrl } from '@/lib/openapi/proxy-token';
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
    specUrl: string | null;
    context: GitBookAnyContext | undefined;
    expandAllResponses?: boolean;
    expandAllModelSections?: boolean;
}): OpenAPIContextInput {
    const { props, specUrl, context, expandAllResponses, expandAllModelSections } = args;
    const { block } = props;

    const customizationLocale = context ? getSpaceLocale(context) : DEFAULT_LOCALE;
    const locale = checkIsValidLocale(customizationLocale) ? customizationLocale : DEFAULT_LOCALE;

    const proxyUrl =
        context && props.context.mode !== 'print'
            ? context.linker.toAbsoluteURL(context.linker.toPathInSite('~scalar/proxy'))
            : undefined;

    return {
        specUrl,
        resolveProxyUrl: proxyUrl
            ? (allowedOrigins: string[]) => buildSignedProxyUrl(proxyUrl, allowedOrigins)
            : undefined,
        icons: {
            chevronDown: <Icon icon="chevron-down" />,
            chevronRight: <Icon icon="chevron-right" />,
            plus: <Icon icon="plus" />,
            copy: <Icon icon="copy" />,
            check: <Icon icon="check" />,
            lock: <Icon icon="lock" />,
        },
        renderCodeBlock: (codeProps) => (
            <PlainCodeBlock
                {...codeProps}
                themeKey="openapi"
                themes={
                    context && 'customization' in context
                        ? context.customization.styling.codeTheme.openapi
                        : undefined
                }
            />
        ),
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
                            leaves: [{ text: headingProps.title, object: 'leaf', marks: [] }],
                        },
                    ],
                }}
            />
        ),
        expandAllResponses: expandAllResponses || props.context.mode === 'print',
        expandAllModelSections: expandAllModelSections || props.context.mode === 'print',
        id: block.meta?.id,
        blockKey: block.key,
        locale,
    };
}
