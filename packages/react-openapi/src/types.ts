import type {
    OpenAPICustomOperationProperties,
    OpenAPICustomSpecProperties,
    OpenAPISchema,
    OpenAPIV3,
} from '@gitbook/openapi-parser';

export interface OpenAPIContextProps extends OpenAPIClientContext {
    /**
     * Render a code block.
     */
    renderCodeBlock: (props: { code: string; syntax: string }) => React.ReactNode;
    /**
     * Render the heading of the operation.
     */
    renderHeading: (props: { deprecated: boolean; title: string }) => React.ReactNode;
    /**
     * Render the document of the operation.
     */
    renderDocument: (props: { document: object }) => React.ReactNode;

    /** Spec url for the Scalar Api Client */
    specUrl: string;
}

export interface OpenAPIClientContext {
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
    /** Optional id attached to the OpenAPI Operation heading and used as an anchor */
    id?: string;
}

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3.SecuritySchemeObject][];
}

export interface OpenAPISchemasData {
    /** Components schemas to be used for schemas */
    schemas: OpenAPISchema[];
}
