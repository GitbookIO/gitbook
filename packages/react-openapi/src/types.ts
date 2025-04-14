import type {
    OpenAPICustomOperationProperties,
    OpenAPICustomSpecProperties,
    OpenAPIV3,
} from '@gitbook/openapi-parser';

export interface OpenAPIClientContext {
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
}

export interface OpenAPIContext extends OpenAPIClientContext {
    /**
     * Render a code block.
     */
    renderCodeBlock: (props: { code: string; syntax: string }) => React.ReactNode;

    /**
     * Render the heading of the operation.
     */
    renderHeading: (props: {
        deprecated?: boolean;
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

export type OpenAPISecurityWithRequired = OpenAPIV3.SecuritySchemeObject & { required?: boolean };

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPISecurityWithRequired][];
}

export interface OpenAPIWebhookData extends OpenAPICustomSpecProperties {
    name: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the webhook */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;
}
