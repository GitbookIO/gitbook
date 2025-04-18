import type {
    OpenAPICustomOperationProperties,
    OpenAPICustomSpecProperties,
    OpenAPIV3,
} from '@gitbook/openapi-parser';

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
