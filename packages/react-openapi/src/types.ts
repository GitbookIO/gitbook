import type {
    OpenAPICustomOperationProperties,
    OpenAPICustomPrefillProperties,
    OpenAPICustomSpecProperties,
    OpenAPIV3,
} from '@gitbook/openapi-parser';

export type OpenAPIServerVariableWithCustomProperties = OpenAPIV3.ServerVariableObject &
    OpenAPICustomPrefillProperties;

/**
 * OpenAPI ServerObject type extended to provide x-gitbook prefill custom properties at the variable level.
 */
export type OpenAPIServerWithCustomProperties = Omit<OpenAPIV3.ServerObject, 'variables'> & {
    variables?: {
        [variable: string]: OpenAPIServerVariableWithCustomProperties;
    };
} & OpenAPICustomPrefillProperties;

export type OpenAPISecuritySchemeWithRequired = OpenAPIV3.SecuritySchemeObject &
    OpenAPICustomPrefillProperties & { required?: boolean };

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIServerWithCustomProperties[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPISecuritySchemeWithRequired][];
}

export interface OpenAPIWebhookData extends OpenAPICustomSpecProperties {
    name: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the webhook */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;
}
