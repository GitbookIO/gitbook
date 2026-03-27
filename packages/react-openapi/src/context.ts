import { type Translation, type TranslationLocale, translations } from './translations';

export interface OpenAPIClientContext {
    /**
     * The translation language to use.
     */
    translation: Translation;

    /**
     * Icons used in the block.
     */
    icons: {
        chevronDown: React.ReactNode;
        chevronRight: React.ReactNode;
        plus: React.ReactNode;
        copy: React.ReactNode;
        check: React.ReactNode;
        lock: React.ReactNode;
    };

    /**
     * If `true`, all response sections will be expanded by default.
     * @default false
     */
    expandAllResponses?: boolean;

    /**
     * If `true`, all model/schema sections will be expanded by default.
     * @default false
     */
    expandAllModelSections?: boolean;

    /**
     * The key of the block
     */
    blockKey?: string;

    /**
     * Optional id attached to the heading and used as an anchor.
     */
    id?: string;

    /**
     * The URL for the Scalar proxy endpoint.
     */
    proxyUrl?: string;

    /**
     * Mark the context as a client context.
     */
    $$isClientContext$$: true;
}

export interface OpenAPIContext
    extends Omit<OpenAPIClientContext, '$$isClientContext$$' | 'proxyUrl'> {
    /**
     * Render a code block.
     */
    renderCodeBlock: (props: { code: string; syntax: string }) => React.ReactNode;

    /**
     * Render the heading of the operation.
     */
    renderHeading: (props: {
        deprecated: boolean;
        title: string;
        stability?: string;
    }) => React.ReactNode;

    /**
     * Render the document of the operation.
     */
    renderDocument: (props: { document: object }) => React.ReactNode;

    /**
     * Public specification URL, used by Scalar's "Test it" modal.
     * When null, the "Test it" button is hidden.
     */
    specUrl: string | null;

    /**
     * Build a signed proxy URL that restricts the proxy to specific origins.
     * Called at render time (server-side) with the server origins for an operation.
     */
    resolveProxyUrl?: (allowedOrigins: string[]) => string | null;
}

export type OpenAPIUniversalContext = OpenAPIClientContext | OpenAPIContext;

export interface OpenAPIContextInput extends Omit<OpenAPIContext, 'translation'> {
    /**
     * The translation language to use.
     * @default 'en'
     */
    locale?: TranslationLocale | undefined;
}

/**
 * Resolve OpenAPI context from the input.
 */
export function resolveOpenAPIContext(context: OpenAPIContextInput): OpenAPIContext {
    const { locale, ...rest } = context;
    return {
        ...rest,
        translation: translations[locale ?? 'en'],
    };
}

/**
 * Get the client context from the OpenAPI context.
 */
export function getOpenAPIClientContext(context: OpenAPIUniversalContext): OpenAPIClientContext {
    return {
        translation: context.translation,
        icons: context.icons,
        expandAllResponses: context.expandAllResponses,
        expandAllModelSections: context.expandAllModelSections,
        blockKey: context.blockKey,
        id: context.id,
        proxyUrl: '$$isClientContext$$' in context ? context.proxyUrl : undefined,
        $$isClientContext$$: true,
    };
}
