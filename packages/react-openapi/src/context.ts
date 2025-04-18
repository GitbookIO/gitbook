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
    };

    /**
     * Force all sections to be opened by default.
     * @default false
     */
    defaultInteractiveOpened?: boolean;

    /**
     * The key of the block
     */
    blockKey?: string;

    /**
     * Optional id attached to the heading and used as an anchor.
     */
    id?: string;

    /**
     * Mark the context as a client context.
     */
    $$isClientContext$$: true;
}

export interface OpenAPIContext extends Omit<OpenAPIClientContext, '$$isClientContext$$'> {
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
     * Specification URL.
     */
    specUrl: string;
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
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        blockKey: context.blockKey,
        id: context.id,
        $$isClientContext$$: true,
    };
}
