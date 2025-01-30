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
