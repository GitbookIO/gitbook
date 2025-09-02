import type { AnyObject } from '@scalar/openapi-parser';
import type { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';

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

    /**
     * Description in HTML format.
     */
    'x-gitbook-description-html'?: string;
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

    /**
     * Description in HTML format.
     */
    'x-gitbook-description-html'?: string;

    /**
     * Description in Document format.
     */
    'x-gitbook-description-document'?: object;

    /**
     * Enums with name and description
     */
    'x-enumDescriptions'?: object;

    /**
     * Enums with name and description
     */
    'x-gitbook-enum'?: {
        [key: string]: {
            description?: string;
            name?: string;
        };
    };

    /**
     * Stability of the operation.
     * @enum 'experimental' | 'alpha' | 'beta'
     */
    'x-stability'?: OpenAPIStability;
}

/**
 * Custom properties that can be defined to enable prefilling for OpenAPI blocks (e.g TryIt functionality).
 */
export interface OpenAPICustomPrefillProperties {
    'x-gitbook-prefill'?: string;
}

export type OpenAPIStability = 'experimental' | 'alpha' | 'beta';

/**
 * Custom code samples that can be defined at the operation level.
 * It follows the spec defined by Redocly.
 * https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
 */
export interface OpenAPICustomCodeSample {
    lang: string;
    label?: string;
    source: string;
}

export type OpenAPIV3xDocument =
    | OpenAPIV3_1.Document<OpenAPICustomSpecProperties>
    | OpenAPIV3.Document<OpenAPICustomSpecProperties>;

/**
 * Not literally a filesystem, but a list of files with their content.
 * This is an abstraction layer to handle multiple files in the browser (without access to the hard disk).
 */
export type Filesystem<T extends AnyObject = AnyObject> = FilesystemEntry<T>[];
/**
 * Holds all information about a single file (doesn’t have to be a literal file, see Filesystem).
 */
export type FilesystemEntry<T extends AnyObject> = {
    dir: string;
    isEntrypoint: boolean;
    references: string[];
    filename: string;
    specification: T;
};

export type OpenAPISchema = {
    name: string;
    schema: OpenAPIV3.SchemaObject;
};
