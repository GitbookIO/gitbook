'use client';

import React from 'react';

import type { CustomizationThemedCodeTheme } from '@gitbook/api';
import {
    OpenAPIOperation as BaseOpenAPIOperation,
    OpenAPISchemas as BaseOpenAPISchemas,
    OpenAPIWebhook as BaseOpenAPIWebhook,
    type OpenAPIContextInput,
} from '@gitbook/react-openapi';

import { ClientPlainCodeBlock } from '../CodeBlock/ClientPlainCodeBlock';
import type { DocumentContext } from '../DocumentView';
import { matchesText } from '../Table/searchMatch';
import { MIN_RECORDS_FOR_SEARCH } from '../Table/shouldShowSearch';
import { Input } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';

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
                <OpenAPISchemasWithSearch
                    data={props.data}
                    grouped={props.grouped}
                    context={context}
                    className={className}
                    isPrint={mode === 'print'}
                />
            );
    }
}

function OpenAPISchemasWithSearch(
    props: React.ComponentProps<typeof BaseOpenAPISchemas> & { isPrint: boolean }
) {
    const { data, isPrint, ...rest } = props;
    const language = useLanguage();
    const [query, setQuery] = React.useState('');
    // A models page can hold hundreds of schemas; keep typing responsive while the list re-renders.
    const deferredQuery = React.useDeferredValue(query).trim();

    if (isPrint || data.schemas.length < MIN_RECORDS_FOR_SEARCH) {
        return <BaseOpenAPISchemas data={data} {...rest} />;
    }

    const schemas = data.schemas.filter(({ name }) => matchesText(name, deferredQuery));

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Input
                label={tString(language, 'search')}
                value={query}
                onValueChange={setQuery}
                leading="magnifying-glass"
                clearButton
                sizing="small"
                keyboardShortcut={false}
            />
            {schemas.length > 0 ? (
                // `grouped` keeps the list layout when the search narrows it down to one model.
                <BaseOpenAPISchemas {...rest} data={{ ...data, schemas }} grouped />
            ) : (
                <div className="mb-14 py-8 text-center text-sm text-tint">
                    {tString(language, 'search_no_results_for', deferredQuery)}
                </div>
            )}
        </div>
    );
}
