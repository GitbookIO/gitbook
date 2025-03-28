import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type React from 'react';
import { stringifyOpenAPI } from './stringifyOpenAPI';

interface OpenAPISchemaNameProps {
    schema?: OpenAPIV3.SchemaObject;
    propertyName?: string | React.JSX.Element;
    required?: boolean;
    type?: string;
}

/**
 * Display the schema name row.
 * It includes the property name, type, required and deprecated status.
 */
export function OpenAPISchemaName(props: OpenAPISchemaNameProps) {
    const { schema, type, propertyName, required } = props;

    const additionalItems = schema && getAdditionalItems(schema);

    return (
        <div className="openapi-schema-name">
            {propertyName ? (
                <span data-deprecated={schema?.deprecated} className="openapi-schema-propertyname">
                    {propertyName}
                </span>
            ) : null}
            <span>
                {type ? <span className="openapi-schema-type">{type}</span> : null}
                {additionalItems ? (
                    <span className="openapi-schema-type">{additionalItems}</span>
                ) : null}
            </span>
            {schema?.readOnly ? <span className="openapi-schema-readonly">read-only</span> : null}
            {schema?.writeOnly ? (
                <span className="openapi-schema-writeonly">write-only</span>
            ) : null}
            {required ? (
                <span className="openapi-schema-required">required</span>
            ) : (
                <span className="openapi-schema-optional">optional</span>
            )}
            {schema?.deprecated ? <span className="openapi-deprecated">Deprecated</span> : null}
        </div>
    );
}

function getAdditionalItems(schema: OpenAPIV3.SchemaObject): string {
    let additionalItems = '';

    if (schema.minimum || schema.minLength || schema.minItems) {
        additionalItems += ` · min: ${schema.minimum || schema.minLength || schema.minItems}`;
    }

    if (schema.maximum || schema.maxLength || schema.maxItems) {
        additionalItems += ` · max: ${schema.maximum || schema.maxLength || schema.maxItems}`;
    }

    // If the schema has a default value, we display it
    if (typeof schema.default !== 'undefined') {
        additionalItems += ` · default: ${stringifyOpenAPI(schema.default)}`;
    }

    if (schema.nullable) {
        additionalItems = ' | nullable';
    }

    return additionalItems;
}
