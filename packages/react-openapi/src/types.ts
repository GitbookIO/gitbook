import type {
    OpenAPICustomOperationProperties,
    OpenAPICustomSpecProperties,
    OpenAPICustomTryItPrefillProperties,
    OpenAPIV3,
} from '@gitbook/openapi-parser';

export type OpenAPIServerVariableWithCustomProperties = OpenAPIV3.ServerVariableObject &
    OpenAPICustomTryItPrefillProperties;

export type OpenAPIServerWithCustomProperties = Omit<OpenAPIV3.ServerObject, 'variables'> & {
    variables?: {
        [variable: string]: OpenAPIServerVariableWithCustomProperties;
    };
} & OpenAPICustomTryItPrefillProperties;

export type OpenAPISecurityWithRequired = OpenAPIV3.SecuritySchemeObject &
    OpenAPICustomTryItPrefillProperties & { required?: boolean };

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIServerWithCustomProperties[];

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
