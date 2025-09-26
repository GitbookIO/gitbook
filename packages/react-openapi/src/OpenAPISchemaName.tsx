import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type React from 'react';
import type { OpenAPIClientContext } from './context';
import { t, tString } from './translate';

interface OpenAPISchemaNameProps {
    schema?: OpenAPIV3.SchemaObject;
    propertyName?: string | React.JSX.Element;
    required?: boolean | null;
    isDiscriminatorProperty?: boolean;
    type?: string;
    context: OpenAPIClientContext;
}

/**
 * Display the schema name row.
 * It includes the property name, type, required and deprecated status.
 */
export function OpenAPISchemaName(props: OpenAPISchemaNameProps) {
    const { schema, type, propertyName, required, isDiscriminatorProperty, context } = props;

    const additionalItems = schema && getAdditionalItems(schema, context);

    return (
        <span className="openapi-schema-name">
            {propertyName ? (
                <span data-deprecated={schema?.deprecated} className="openapi-schema-propertyname">
                    {propertyName}
                </span>
            ) : null}
            {isDiscriminatorProperty ? (
                <span className="openapi-schema-discriminator">
                    {t(context.translation, 'discriminator')}
                </span>
            ) : null}
            {type || additionalItems ? (
                <span>
                    {schema?.const ? (
                        <span className="openapi-schema-type">const: {schema?.const}</span>
                    ) : type ? (
                        <span className="openapi-schema-type">{type}</span>
                    ) : null}
                    {additionalItems ? (
                        <span className="openapi-schema-type">{additionalItems}</span>
                    ) : null}
                </span>
            ) : null}
            {schema?.readOnly ? (
                <span className="openapi-schema-readonly">
                    {t(context.translation, 'read_only')}
                </span>
            ) : null}
            {schema?.writeOnly ? (
                <span className="openapi-schema-writeonly">
                    {t(context.translation, 'write_only')}
                </span>
            ) : null}
            {required === null ? null : required ? (
                <span className="openapi-schema-required">
                    {t(context.translation, 'required')}
                </span>
            ) : (
                <span className="openapi-schema-optional">
                    {t(context.translation, 'optional')}
                </span>
            )}
            {schema?.deprecated ? (
                <span className="openapi-deprecated">{t(context.translation, 'deprecated')}</span>
            ) : null}
        </span>
    );
}

function getAdditionalItems(schema: OpenAPIV3.SchemaObject, context: OpenAPIClientContext): string {
    let additionalItems = '';

    if (schema.minimum || schema.minLength || schema.minItems) {
        additionalItems += ` · ${tString(context.translation, 'min').toLowerCase()}: ${schema.minimum || schema.minLength || schema.minItems}`;
    }

    if (schema.maximum || schema.maxLength || schema.maxItems) {
        additionalItems += ` · ${tString(context.translation, 'max').toLowerCase()}: ${schema.maximum || schema.maxLength || schema.maxItems}`;
    }

    if (schema.nullable) {
        additionalItems = ` | ${tString(context.translation, 'nullable').toLowerCase()}`;
    }

    return additionalItems;
}
