import type { OpenAPISchema, OpenAPIV3 } from '@gitbook/openapi-parser';
import { generateSchemaExample } from '../generateSchemaExample';
import { checkIsReference } from '../utils';
import { type GeneratedExampleOptions, writeGeneratedExample } from './generated-examples';

function precompute(
    schema: OpenAPIV3.SchemaObject | undefined,
    options: GeneratedExampleOptions
): void {
    if (!schema || checkIsReference(schema)) {
        return;
    }

    writeGeneratedExample(schema, options, generateSchemaExample(schema, options));
}

function precomputeContent(
    content: Record<string, OpenAPIV3.MediaTypeObject> | undefined,
    mode: 'read' | 'write',
    // Only `getExamplesFromMediaTypeObject` asks for the XML shape; the code sample generator asks
    // for the plain one whatever the media type.
    xmlVariant: boolean
): void {
    for (const [mediaType, mediaTypeObject] of Object.entries(content ?? {})) {
        precompute(mediaTypeObject?.schema, {
            mode,
            xml: xmlVariant && mediaType === 'application/xml',
        });
    }
}

// Coverage must stay total: any variant missing here is generated in the browser instead, which is
// what the precomputation exists to prevent. Call sites are `OpenAPICodeSample` and `util/example`.
export function precomputeOperationExamples(operation: OpenAPIV3.OperationObject): void {
    const parameters = Array.isArray(operation.parameters) ? operation.parameters : [];
    for (const parameter of parameters) {
        if (parameter && !checkIsReference(parameter)) {
            precompute(parameter.schema, { mode: 'write' });
        }
    }

    if (operation.requestBody && !checkIsReference(operation.requestBody)) {
        precomputeContent(operation.requestBody.content, 'write', false);
    }

    for (const response of Object.values(operation.responses ?? {})) {
        if (response && !checkIsReference(response)) {
            precomputeContent(response.content, 'read', true);
        }
    }
}

export function precomputeSchemasExamples(schemas: OpenAPISchema[]): void {
    for (const { schema } of schemas) {
        precompute(schema, { mode: 'read' });
    }
}
