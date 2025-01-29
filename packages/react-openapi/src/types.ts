import { OpenAPIV3_1 } from '@scalar/openapi-types';

export type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Custom properties that can be defined at the entire spec level.
 */
export interface OpenAPICustomSpecProperties {
    /**
     * If `true`, code samples will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-codeSamples'?: boolean;

    /**
     * If `true`, the "Try it" button will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom properties that can be defined at the operation level.
 * These properties are not part of the OpenAPI spec.
 */
export interface OpenAPICustomOperationProperties {
    'x-code-samples'?: OpenAPICustomCodeSample[];
    'x-codeSamples'?: OpenAPICustomCodeSample[] | false;
    'x-custom-examples'?: OpenAPICustomCodeSample[];

    /**
     * If `true`, the "Try it" button will not be displayed.
     * https://redocly.com/docs/api-reference-docs/specification-extensions/x-hidetryitpanel/
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom code samples that can be defined at the operation level.
 * It follows the spec defined by Redocly.
 * https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
 */
export interface OpenAPICustomCodeSample {
    lang: string;
    label: string;
    source: string;
}

export interface OpenAPIContextProps extends OpenAPIClientContext {
    CodeBlock: React.ComponentType<{ code: string; syntax: string }>;

    /** Spec url for the Scalar Api Client */
    specUrl: string;
}

export interface OpenAPIClientContext {
    icons: {
        chevronDown: React.ReactNode;
        chevronRight: React.ReactNode;
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
    /** Optional id attached to the OpenAPI Operation heading and used as an anchor */
    id?: string;
}

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL. It should return a fully parsed OpenAPI v3 document.
     */
    fetch: (url: string) => Promise<OpenAPIV3_1.Document<OpenAPICustomSpecProperties>>;

    /**
     * Parse markdown to the react element to render.
     */
    parseMarkdown?: (input: string) => Promise<string>;
}
