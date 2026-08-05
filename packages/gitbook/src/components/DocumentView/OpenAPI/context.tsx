import type { JSONDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import {
    type OpenAPIContextInput,
    type OpenAPIOperationData,
    type OpenAPIWebhookData,
    checkIsValidLocale,
    extractOrigin,
    getAllServerOrigins,
    getOperationTitle,
} from '@gitbook/react-openapi/core';

import type { BlockProps } from '../Block';
import { PlainCodeBlock } from '../CodeBlock';
import { DocumentView } from '../DocumentView';
import { Heading } from '../Heading';
import type { OpenAPIBlockClientContextProps } from './OpenAPIBlockClient';

import './style.css';
import { DEFAULT_LOCALE, getSpaceLocale } from '@/intl/server';
import type { GitBookAnyContext } from '@/lib/context';
import { GITBOOK_URL } from '@/lib/env';
import { buildSignedProxyUrl } from '@/lib/openapi/proxy-token';
import type {
    AnyOpenAPIOperationsBlock,
    OpenAPISchemasBlock,
    OpenAPIWebhookBlock,
} from '@/lib/openapi/types';

// Serve the proxy from GitBook's own origin rather than the customer domain, so a proxied
// response can never execute as HTML under a customer's trusted origin.
const OPEN_ORIGIN_PROXY_URL = GITBOOK_URL
    ? new URL('/~scalar/proxy', GITBOOK_URL).toString()
    : null;

/**
 * Get the OpenAPI context to render a block.
 */
export function getOpenAPIContext(args: {
    props: BlockProps<AnyOpenAPIOperationsBlock | OpenAPISchemasBlock | OpenAPIWebhookBlock>;
    specUrl: string | null;
    context: GitBookAnyContext | undefined;
    expandAllResponses?: boolean;
    expandAllModelSections?: boolean;
    headless?: boolean;
}): OpenAPIContextInput {
    const { props, specUrl, context, expandAllResponses, expandAllModelSections, headless } = args;
    const { block } = props;

    const customizationLocale = context ? getSpaceLocale(context) : DEFAULT_LOCALE;
    const locale = checkIsValidLocale(customizationLocale) ? customizationLocale : DEFAULT_LOCALE;

    const siteId = context && 'site' in context ? context.site.id : undefined;

    // Fall back to the site's own host root when GITBOOK_URL is unset (self-hosted single-origin);
    // the proxy route is only ever mounted at the host root, never under the site base path.
    const proxyUrl =
        context && siteId && props.context.mode !== 'print'
            ? (OPEN_ORIGIN_PROXY_URL ?? context.linker.toAbsoluteURL('/~scalar/proxy'))
            : undefined;

    return {
        specUrl,
        resolveProxyUrl:
            proxyUrl && siteId
                ? (allowedOrigins: string[]) =>
                      buildSignedProxyUrl(proxyUrl, allowedOrigins, siteId)
                : undefined,
        icons: {
            chevronDown: <Icon icon="chevron-down" />,
            chevronRight: <Icon icon="chevron-right" />,
            plus: <Icon icon="plus" />,
            copy: <Icon icon="copy" />,
            check: <Icon icon="check" />,
            lock: <Icon icon="lock" />,
            mcp: <Icon icon="mcp" />,
            hashtag: <Icon icon="hashtag" />,
        },
        renderCodeBlock: (codeProps) => (
            <PlainCodeBlock
                {...codeProps}
                mode={props.context.mode}
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
        headless,
        id: block.meta?.id,
        blockKey: block.key,
        locale,
    };
}

// Same inputs as `getOpenAPIContext`, but anything that can't cross the RSC boundary is pre-rendered
// here or rebuilt on the client, so the block can sit behind a `next/dynamic` chunk.
export function getOpenAPIBlockClientProps(args: {
    props: BlockProps<AnyOpenAPIOperationsBlock | OpenAPISchemasBlock | OpenAPIWebhookBlock>;
    /** Omitted for schemas blocks, which have no operation, servers or heading. */
    data?: OpenAPIOperationData | OpenAPIWebhookData;
    specUrl: string | null;
    context: GitBookAnyContext | undefined;
    expandAllResponses?: boolean;
    expandAllModelSections?: boolean;
    headless?: boolean;
}): OpenAPIBlockClientContextProps {
    const { props, data, specUrl, context } = args;
    const serverContext = getOpenAPIContext(args);
    const { renderCodeBlock, renderDocument, renderHeading, resolveProxyUrl, ...serializable } =
        serverContext;

    const title = data ? getOperationTitle(data) : undefined;
    const descriptionDocument = data?.operation['x-gitbook-description-document'];

    const origins = data ? getAllServerOrigins(data.servers) : [];
    const specOrigin = specUrl ? extractOrigin(specUrl) : null;
    if (specOrigin) {
        origins.push(specOrigin);
    }

    return {
        ...serializable,
        mode: props.context.mode,
        codeTheme:
            context && 'customization' in context
                ? context.customization.styling.codeTheme.openapi
                : undefined,
        proxyUrl: resolveProxyUrl?.(origins) ?? undefined,
        headingNode:
            data && !serializable.headless && title
                ? renderHeading({ deprecated: data.operation.deprecated ?? false, title })
                : null,
        descriptionNode: descriptionDocument
            ? renderDocument({ document: descriptionDocument })
            : null,
    };
}
