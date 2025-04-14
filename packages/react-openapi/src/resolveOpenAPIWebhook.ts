import { fromJSON, toJSON } from 'flatted';

import type {
    Filesystem,
    OpenAPIV3,
    OpenAPIV3_1,
    OpenAPIV3xDocument,
} from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from './dereference';
import type { OpenAPIWebhookData } from './types';

export { fromJSON, toJSON };

/**
 * Resolve an OpenAPI webhook in a file and compile it to a more usable format.
 */
export async function resolveOpenAPIWebhook(
    filesystem: Filesystem<OpenAPIV3xDocument>,
    webhookDescriptor: {
        name: string;
        method: string;
    }
): Promise<OpenAPIWebhookData | null> {
    const { name, method } = webhookDescriptor;
    const schema = await dereferenceFilesystem(filesystem);
    let operation = getWebhookByNameAndMethod(schema, name, method);

    if (!operation) {
        return null;
    }

    // Resolve common parameters
    const commonParameters = getPathObjectParameter(schema, name);
    if (commonParameters) {
        operation = {
            ...operation,
            parameters: [...commonParameters, ...(operation.parameters ?? [])],
        };
    }

    const servers = 'servers' in schema ? (schema.servers ?? []) : [];

    return {
        servers,
        operation,
        method,
        name,
    };
}

/**
 * Get a path object from its path.
 */
function getPathObject(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    name: string
): OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject | null {
    if (schema.webhooks?.[name]) {
        return schema.webhooks[name];
    }
    return null;
}

/**
 * Resolve parameters from a path in an OpenAPI schema.
 */
function getPathObjectParameter(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string
):
    | (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    | (OpenAPIV3.ParameterObject | OpenAPIV3_1.ReferenceObject)[]
    | null {
    const pathObject = getPathObject(schema, path);
    if (pathObject?.parameters) {
        return pathObject.parameters;
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getWebhookByNameAndMethod(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    name: string,
    method: string
): OpenAPIV3.OperationObject | null {
    // Types are buffy for OpenAPIV3_1.OperationObject, so we use v3
    const pathObject = getPathObject(schema, name);
    if (!pathObject) {
        return null;
    }
    const normalizedMethod = method.toLowerCase();
    if (!pathObject[normalizedMethod]) {
        return null;
    }
    return pathObject[normalizedMethod];
}
