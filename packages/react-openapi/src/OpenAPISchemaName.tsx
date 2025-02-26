import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type React from 'react';

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
            {required ? <span className="openapi-schema-required">required</span> : null}
            {schema?.deprecated ? <span className="openapi-deprecated">Deprecated</span> : null}
        </div>
    );
}

function getAdditionalItems(schema: OpenAPIV3.SchemaObject): string {
    let additionalItems = '';

    if (schema.minimum || schema.minLength) {
        additionalItems += ` · min: ${schema.minimum || schema.minLength}`;
    }

    if (schema.maximum || schema.maxLength) {
        additionalItems += ` · max: ${schema.maximum || schema.maxLength}`;
    }

    // If the schema has a default value, we display it
    if (typeof schema.default !== 'undefined') {
        additionalItems += ` · default: ${schema.default}`;
    }

    if (schema.nullable) {
        additionalItems = ' | nullable';
    }

    return additionalItems;
}
