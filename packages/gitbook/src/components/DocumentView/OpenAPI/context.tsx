import type { JSONDocument } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
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
    headless?: boolean;
}): OpenAPIContextInput {
    const { props, specUrl, context, expandAllResponses, expandAllModelSections, headless } = args;
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
        getCodeSampleIcon: (sample) => (
            <Icon icon={getCodeSampleIconName(sample)} className="me-1.5 size-4 shrink-0" />
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

/**
 * Resolve the icon shown next to a code sample language in the selector.
 * Falls back to a generic code icon for unknown languages.
 */
function getCodeSampleIconName(sample: { id?: string; syntax: string; label: string }): IconName {
    const key = (sample.id ?? sample.syntax).toLowerCase();
    switch (key) {
        case 'http':
            return 'globe';
        case 'curl':
        case 'bash':
        case 'sh':
        case 'shell':
        case 'zsh':
            return 'square-terminal';
        case 'javascript':
        case 'js':
        case 'jsx':
        case 'mjs':
        case 'cjs':
        case 'node':
            return 'js';
        case 'python':
        case 'py':
            return 'python';
        case 'go':
        case 'golang':
            return 'golang';
        case 'rust':
        case 'rs':
            return 'rust';
        case 'php':
            return 'php';
        case 'java':
            return 'java';
        case 'swift':
            return 'swift';
        case 'json':
            return 'brackets-curly';
        default:
            return 'code';
    }
}
