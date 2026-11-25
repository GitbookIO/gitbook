import type { OpenAPIV3 } from '@gitbook/openapi-parser';

import {
    isFormData,
    isFormUrlEncoded,
    isJSON,
    isPlainObject,
    isText,
    isXML,
    isYAML,
} from '../contentTypeChecks';
import { generateMediaTypeExamples, generateSchemaExample } from '../generateSchemaExample';
import { json2xml } from '../json2xml';
import { stringifyOpenAPI } from '../stringifyOpenAPI';
import type { OpenAPIOperationData } from '../types';
import { checkIsReference } from '../utils';
import type {
    TryItBodyField,
    TryItMediaType,
    TryItOperation,
    TryItParameter,
    TryItParameterLocation,
    TryItSecurityOption,
} from './types';

const PARAMETER_LOCATIONS = new Set<string>(['path', 'query', 'header', 'cookie']);

/**
 * Reduce an operation to what the Try it panel needs, so the client never receives the full
 * (possibly huge, possibly circular) dereferenced operation.
 */
export function buildTryItOperation(data: OpenAPIOperationData): TryItOperation {
    return {
        method: data.method,
        path: data.path,
        parameters: buildParameters(data.operation.parameters),
        body: buildBody(data.operation.requestBody),
        securityOptions: buildSecurityOptions(data),
    };
}

function buildParameters(parameters: OpenAPIV3.OperationObject['parameters']): TryItParameter[] {
    // The parser can return an object instead of an array for invalid specs.
    if (!Array.isArray(parameters)) {
        return [];
    }

    const result: TryItParameter[] = [];
    const seen = new Set<string>();
    // Operation-level parameters come last and override path-level ones with the same key.
    for (const parameter of [...parameters].reverse()) {
        if (!parameter || checkIsReference(parameter) || !parameter.name) {
            continue;
        }
        if (!parameter.in || !PARAMETER_LOCATIONS.has(parameter.in)) {
            continue;
        }
        const key = `${parameter.in}:${parameter.name}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);

        const schema = checkIsReference(parameter.schema) ? undefined : parameter.schema;
        result.unshift({
            name: parameter.name,
            in: parameter.in as TryItParameterLocation,
            required: parameter.in === 'path' || Boolean(parameter.required),
            description: parameter.description,
            ...(parameter.in === 'query' &&
            schema?.type === 'array' &&
            (parameter.style ?? 'form') === 'form' &&
            parameter.explode !== false
                ? { explode: true }
                : {}),
            ...describeField(schema, parameter.example ?? firstExampleValue(parameter.examples)),
        });
    }
    return result;
}

function buildBody(requestBody: OpenAPIV3.OperationObject['requestBody']): TryItOperation['body'] {
    if (!requestBody || checkIsReference(requestBody) || !requestBody.content) {
        return null;
    }

    const mediaTypes = Object.entries(requestBody.content).map(([mediaType, mediaTypeObject]) =>
        buildMediaType(mediaType, mediaTypeObject)
    );
    if (mediaTypes.length === 0) {
        return null;
    }

    return { required: Boolean(requestBody.required), mediaTypes };
}

function buildMediaType(
    mediaType: string,
    mediaTypeObject: OpenAPIV3.MediaTypeObject
): TryItMediaType {
    const schema = checkIsReference(mediaTypeObject.schema) ? undefined : mediaTypeObject.schema;
    const formLike = isFormData(mediaType) || isFormUrlEncoded(mediaType);
    const fields = formLike ? buildBodyFields(schema) : [];

    if (formLike && fields.length > 0) {
        return {
            mediaType,
            kind: isFormData(mediaType) ? 'multipart' : 'form',
            examples: [],
            fields,
        };
    }

    if (isBinaryMediaType(mediaType, schema)) {
        return { mediaType, kind: 'binary', examples: [], fields: [] };
    }

    const examples = generateMediaTypeExamples(mediaTypeObject, { mode: 'write' })
        .filter((example) => example.value !== undefined)
        .map((example, index) => ({
            label: example.summary || `Example ${index + 1}`,
            value: formatBodyExample(mediaType, example.value),
        }));

    return { mediaType, kind: 'raw', examples, fields: [] };
}

function buildBodyFields(schema: OpenAPIV3.SchemaObject | undefined): TryItBodyField[] {
    if (!schema?.properties) {
        return [];
    }
    const required = new Set(schema.required ?? []);

    return Object.entries(schema.properties).flatMap(([name, property]) => {
        if (checkIsReference(property) || property.readOnly) {
            return [];
        }
        const binary = isBinarySchema(property);
        return [
            {
                name,
                required: required.has(name),
                description: property.description,
                binary,
                ...(binary ? {} : describeField(property, undefined)),
            },
        ];
    });
}

function buildSecurityOptions(data: OpenAPIOperationData): TryItSecurityOption[] {
    const known = new Set(data.securities.map(([name]) => name));
    const requirements = data.operation.security;

    if (!requirements || requirements.length === 0) {
        return data.securities.map(([name]) => ({ label: name, schemes: [name] }));
    }

    const options = new Map<string, TryItSecurityOption>();
    for (const requirement of requirements) {
        const schemes = Object.keys(requirement)
            .filter((name) => known.has(name))
            .sort();
        // An empty requirement (`{}`) means the operation can be called anonymously.
        const label = schemes.length ? schemes.join(' & ') : '';
        if (!options.has(label)) {
            options.set(label, { label, schemes });
        }
    }
    return Array.from(options.values());
}

function describeField(
    schema: OpenAPIV3.SchemaObject | undefined,
    explicitExample: unknown
): Pick<TryItParameter, 'enum' | 'placeholder' | 'defaultValue'> {
    const values =
        schema?.enum ??
        (isPlainObject(schema?.items) ? schema.items.enum : undefined) ??
        (schema?.type === 'boolean' ? [true, false] : undefined);
    const enumValues = Array.isArray(values)
        ? values.filter((value) => value !== null).map((value) => toInputValue(value))
        : undefined;

    const explicit = schema?.default ?? explicitExample ?? schema?.example;
    let generated =
        explicit === undefined && schema
            ? generateSchemaExample(schema, { mode: 'write' })
            : explicit;
    // The generator's stand-in for a plain string; the type tells the reader more.
    if (explicit === undefined && generated === 'text' && schema) {
        generated = schema.format ?? 'string';
    }

    return {
        ...(enumValues?.length ? { enum: enumValues } : {}),
        ...(generated !== undefined && generated !== null
            ? { placeholder: toInputValue(generated) }
            : {}),
        ...(explicit !== undefined && explicit !== null
            ? { defaultValue: toInputValue(explicit) }
            : {}),
    };
}

function firstExampleValue(examples: OpenAPIV3.ParameterObject['examples']): unknown {
    const first = examples ? Object.values(examples)[0] : undefined;
    return first && !checkIsReference(first) ? first.value : undefined;
}

function toInputValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    // Arrays of scalars are typed comma-separated, the way most APIs accept them in a query.
    if (Array.isArray(value) && value.every((item) => typeof item !== 'object')) {
        return value.join(',');
    }
    return stringifyOpenAPI(value);
}

function formatBodyExample(mediaType: string, value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (isXML(mediaType) && isPlainObject(value)) {
        return json2xml(value);
    }
    if (isJSON(mediaType) || isYAML(mediaType) || isText(mediaType) || isPlainObject(value)) {
        return stringifyOpenAPI(value, null, 2);
    }
    return String(value);
}

function isBinarySchema(schema: OpenAPIV3.SchemaObject): boolean {
    const items = isPlainObject(schema.items) ? (schema.items as OpenAPIV3.SchemaObject) : null;
    return (
        schema.format === 'binary' ||
        'contentMediaType' in schema ||
        (schema.type === 'array' && items !== null && isBinarySchema(items))
    );
}

function isBinaryMediaType(mediaType: string, schema: OpenAPIV3.SchemaObject | undefined) {
    const lower = mediaType.toLowerCase();
    return (
        lower === 'application/octet-stream' ||
        lower.startsWith('image/') ||
        lower.startsWith('audio/') ||
        lower.startsWith('video/') ||
        lower === 'application/pdf' ||
        (schema !== undefined && schema.format === 'binary')
    );
}
