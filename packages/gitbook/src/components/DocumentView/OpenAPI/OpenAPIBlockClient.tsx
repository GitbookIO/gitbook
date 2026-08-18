'use client';

import type React from 'react';

import type { CustomizationThemedCodeTheme } from '@gitbook/api';
import {
    OpenAPIOperation as BaseOpenAPIOperation,
    OpenAPISchemas as BaseOpenAPISchemas,
    OpenAPIWebhook as BaseOpenAPIWebhook,
    type OpenAPIContextInput,
} from '@gitbook/react-openapi';

import { ClientPlainCodeBlock } from '../CodeBlock/ClientPlainCodeBlock';
import type { DocumentContext } from '../DocumentView';

// Only what survives the RSC boundary. Rebuilding the renderers on the client is what lets this
// whole subtree sit behind a `next/dynamic` chunk instead of the route's eager entry.
export type OpenAPIBlockClientContextProps = {
    className?: string;
    mode: DocumentContext['mode'];
    codeTheme?: CustomizationThemedCodeTheme;
    icons: OpenAPIContextInput['icons'];
    specUrl: string | null;
    /** Pre-signed server-side: signing needs a secret the client must never see. */
    proxyUrl?: string;
    locale?: OpenAPIContextInput['locale'];
    expandAllResponses?: boolean;
    expandAllModelSections?: boolean;
    headless?: boolean;
    id?: string;
    blockKey?: string;
    /** Rendered on the server: both go through the async document pipeline. */
    headingNode: React.ReactNode;
    descriptionNode: React.ReactNode;
    scalarRuntimeURL: string;
};

type OpenAPIBlockVariant =
    | { variant: 'operation'; data: React.ComponentProps<typeof BaseOpenAPIOperation>['data'] }
    | { variant: 'webhook'; data: React.ComponentProps<typeof BaseOpenAPIWebhook>['data'] }
    | {
          variant: 'schemas';
          data: React.ComponentProps<typeof BaseOpenAPISchemas>['data'];
          grouped?: boolean;
      };

export type OpenAPIBlockClientProps = OpenAPIBlockClientContextProps & OpenAPIBlockVariant;

export function OpenAPIBlockClient(props: OpenAPIBlockClientProps) {
    const { className, mode, codeTheme, headingNode, descriptionNode, proxyUrl } = props;

    const context: OpenAPIContextInput = {
        icons: props.icons,
        specUrl: props.specUrl,
        locale: props.locale,
        expandAllResponses: props.expandAllResponses,
        expandAllModelSections: props.expandAllModelSections,
        headless: props.headless,
        id: props.id,
        blockKey: props.blockKey,
        renderCodeBlock: ({ code, syntax }) => (
            <ClientPlainCodeBlock code={code} syntax={syntax} mode={mode} themes={codeTheme} />
        ),
        renderDocument: () => descriptionNode,
        renderHeading: () => headingNode,
        resolveProxyUrl: proxyUrl ? () => proxyUrl : undefined,
        scalarRuntimeURL: props.scalarRuntimeURL,
    };

    switch (props.variant) {
        case 'operation':
            return (
                <BaseOpenAPIOperation data={props.data} context={context} className={className} />
            );
        case 'webhook':
            return <BaseOpenAPIWebhook data={props.data} context={context} className={className} />;
        case 'schemas':
            return (
                <BaseOpenAPISchemas
                    data={props.data}
                    grouped={props.grouped}
                    context={context}
                    className={className}
                />
            );
    }
}
