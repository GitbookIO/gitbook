import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import React, { useId } from 'react';

import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { SYMBOL_REF_RESOLVED } from './resolveOpenAPIPath';
import { OpenAPIClientContext } from './types';
import { noReference } from './utils';

type CircularRefsIds = Map<OpenAPIV3.SchemaObject, string>;

interface OpenAPISchemaPropertyEntry {
    propertyName?: string;
    required?: boolean;
    schema: OpenAPIV3.SchemaObject;
}

/**
 * Render a property of an OpenAPI schema.
 */
export function OpenAPISchemaProperty(
    props: OpenAPISchemaPropertyEntry & {
        /** Set of objects already observed as parents */
        circularRefs?: CircularRefsIds;
        context: OpenAPIClientContext;
        className?: string;
    },
) {
    const {
        propertyName,
        required,
        schema,
        circularRefs: parentCircularRefs = new Map<OpenAPIV3.SchemaObject, string>(),
        context,
        className,
    } = props;

    const id = useId();

    const parentCircularRef = parentCircularRefs.get(schema);
    const circularRefs = new Map(parentCircularRefs).set(schema, id);

    // Avoid recursing infinitely, and instead render a link to the parent schema
    const properties = parentCircularRef ? null : getSchemaProperties(schema);
    const alternatives = parentCircularRef
        ? null
        : getSchemaAlternatives(schema, new Set(circularRefs.keys()));

    return (
        <InteractiveSection
            id={id}
            className={classNames('openapi-schema', className)}
            toggeable={!!properties || !!alternatives}
            defaultOpened={!!context.defaultInteractiveOpened}
            toggleOpenIcon={context.icons.chevronRight}
            toggleCloseIcon={context.icons.chevronDown}
            tabs={alternatives?.[0].map((alternative, index) => ({
                key: `${index}`,
                label: getSchemaTitle(alternative, alternatives[1]),
                body: circularRefs.has(alternative) ? (
                    <OpenAPISchemaCircularRef
                        id={circularRefs.get(alternative)!}
                        schema={alternative}
                    />
                ) : (
                    <OpenAPISchemaAlternative
                        schema={alternative}
                        circularRefs={circularRefs}
                        context={context}
                    />
                ),
            }))}
            header={
                <div className={classNames('openapi-schema-presentation')}>
                    <div className={classNames('openapi-schema-name')}>
                        {propertyName ? (
                            <span className={classNames('openapi-schema-propertyname')}>
                                {propertyName}
                            </span>
                        ) : null}
                        {required ? (
                            <span className={classNames('openapi-schema-required')}>*</span>
                        ) : null}
                        <span className={classNames('openapi-schema-type')}>
                            {getSchemaTitle(schema)}
                        </span>
                    </div>
                    {schema.description ? (
                        <Markdown
                            source={schema.description}
                            className="openapi-schema-description"
                        />
                    ) : null}
                </div>
            }
        >
            {(properties && properties.length > 0) ||
            (schema.enum && schema.enum.length > 0) ||
            parentCircularRef ? (
                <>
                    {properties?.length ? (
                        <OpenAPISchemaProperties
                            properties={properties}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    ) : null}
                    {schema.enum && schema.enum.length > 0 ? (
                        <OpenAPISchemaEnum enumValues={schema.enum} />
                    ) : null}
                    {parentCircularRef ? (
                        <OpenAPISchemaCircularRef id={parentCircularRef} schema={schema} />
                    ) : null}
                </>
            ) : null}
        </InteractiveSection>
    );
}

/**
 * Render a set of properties of an OpenAPI schema.
 */
export function OpenAPISchemaProperties(props: {
    id?: string;
    properties: OpenAPISchemaPropertyEntry[];
    circularRefs?: CircularRefsIds;
    context: OpenAPIClientContext;
}) {
    const { id, properties, circularRefs, context } = props;

    if (!properties.length) {
        return null;
    }

    return (
        <div id={id} className={classNames('openapi-schema-properties')}>
            {properties.map((property) => (
                <OpenAPISchemaProperty
                    key={property.propertyName}
                    circularRefs={circularRefs}
                    {...property}
                    context={context}
                />
            ))}
        </div>
    );
}

/**
 * Render a root schema (such as the request body or response body).
 */
export function OpenAPIRootSchema(props: {
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
}) {
    const { schema, context } = props;

    // Avoid recursing infinitely, and instead render a link to the parent schema
    const properties = getSchemaProperties(schema);

    if (properties && properties.length > 0) {
        return <OpenAPISchemaProperties properties={properties} context={context} />;
    }

    return (
        <OpenAPISchemaProperty schema={schema} context={context} className="openapi-schema-root" />
    );
}

/**
 * Render a tab for an alternative schema.
 */
function OpenAPISchemaAlternative(props: {
    schema: OpenAPIV3.SchemaObject;
    circularRefs?: CircularRefsIds;
    context: OpenAPIClientContext;
}) {
    const { schema, circularRefs, context } = props;
    const id = useId();

    return (
        <OpenAPISchemaProperties
            id={id}
            properties={getSchemaProperties(schema) ?? []}
            circularRefs={new Map(circularRefs).set(schema, id)}
            context={context}
        />
    );
}

/**
 * Render a circular reference to a schema.
 */
function OpenAPISchemaCircularRef(props: { id: string; schema: OpenAPIV3.SchemaObject }) {
    const { id, schema } = props;

    return (
        <div className="openapi-schema-circular">
            Circular reference to <a href={`#${id}`}>{getSchemaTitle(schema)}</a>{' '}
            <span className="openapi-schema-circular-glyph">↩</span>
        </div>
    );
}

/**
 * Render the enum value for a schema.
 */
export function OpenAPISchemaEnum(props: { enumValues: any[] }) {
    const { enumValues } = props;

    return (
        <div className="openapi-schema-enum">
            {enumValues.map((value, index) => (
                <span key={index} className="openapi-schema-enum-value">{`${value}`}</span>
            ))}
        </div>
    );
}

/**
 * Get the sub-properties of a schema.
 */
function getSchemaProperties(schema: OpenAPIV3.SchemaObject): null | OpenAPISchemaPropertyEntry[] {
    if (schema.allOf) {
        return schema.allOf.reduce((acc, subSchema) => {
            const properties = getSchemaProperties(noReference(subSchema)) ?? [
                {
                    schema: noReference(subSchema),
                },
            ];
            return [...acc, ...properties];
        }, [] as OpenAPISchemaPropertyEntry[]);
    }

    // check array AND schema.items as this is sometimes null despite what the type indicates
    if (schema.type === 'array' && !!schema.items) {
        const items = noReference(schema.items);
        const itemProperties = getSchemaProperties(items);
        if (itemProperties) {
            return itemProperties;
        }

        return [
            {
                propertyName: 'items',
                schema: items,
            },
        ];
    }

    if (schema.type === 'object' || schema.properties) {
        const result: OpenAPISchemaPropertyEntry[] = [];

        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propertyName, rawPropertySchema]) => {
                const propertySchema = noReference(rawPropertySchema);
                if (propertySchema.deprecated) {
                    return;
                }

                result.push({
                    propertyName,
                    required: Array.isArray(schema.required)
                        ? schema.required.includes(propertyName)
                        : undefined,
                    schema: propertySchema,
                });
            });
        }

        if (schema.additionalProperties) {
            const additionalProperties = noReference(schema.additionalProperties);

            result.push({
                propertyName: 'Other properties',
                schema: additionalProperties === true ? {} : additionalProperties,
            });
        }

        return result;
    }

    return null;
}

/**
 * Get the alternatives to display for a schema.
 */
export function getSchemaAlternatives(
    schema: OpenAPIV3.SchemaObject,
    ancestors: Set<OpenAPIV3.SchemaObject> = new Set(),
): null | [OpenAPIV3.SchemaObject[], OpenAPIV3.DiscriminatorObject | undefined] {
    const downAncestors = new Set(ancestors).add(schema);

    if (schema.anyOf) {
        return [
            flattenAlternatives('anyOf', schema.anyOf.map(noReference), downAncestors),
            noReference(schema.discriminator),
        ];
    }

    if (schema.oneOf) {
        return [
            flattenAlternatives('oneOf', schema.oneOf.map(noReference), downAncestors),
            noReference(schema.discriminator),
        ];
    }

    if (schema.allOf) {
        // allOf is managed in `getSchemaProperties`
        return null;
    }

    return null;
}

function flattenAlternatives(
    alternativeType: 'oneOf' | 'allOf' | 'anyOf',
    alternatives: OpenAPIV3.SchemaObject[],
    ancestors: Set<OpenAPIV3.SchemaObject>,
): OpenAPIV3.SchemaObject[] {
    return alternatives.reduce((acc, alternative) => {
        if (!!alternative[alternativeType] && !ancestors.has(alternative)) {
            return [...acc, ...(getSchemaAlternatives(alternative, ancestors)?.[0] || [])];
        }

        return [...acc, alternative];
    }, [] as OpenAPIV3.SchemaObject[]);
}

function getSchemaTitle(
    schema: OpenAPIV3.SchemaObject,

    /** If the title is inferred in a oneOf with discriminator, we can use it to optimize the title */
    discriminator?: OpenAPIV3.DiscriminatorObject,
): string {
    if (schema.title) {
        // If the schema has a title, use it
        return schema.title;
    }

    // Try using the discriminator
    if (discriminator && schema.properties) {
        const discriminatorProperty = noReference(schema.properties[discriminator.propertyName]);
        if (discriminatorProperty) {
            if (discriminatorProperty.enum) {
                return discriminatorProperty.enum.map((value) => value.toString()).join(' | ');
            }
        }
    }

    // Otherwise try to infer a nice title
    let type = 'any';

    if (schema.enum) {
        type = 'enum';
        // check array AND schema.items as this is sometimes null despite what the type indicates
    } else if (schema.type === 'array' && !!schema.items) {
        type = `array of ${getSchemaTitle(noReference(schema.items))}`;
    } else if (schema.type || schema.properties) {
        type = schema.type ?? 'object';

        if (schema.format) {
            type += ` (${schema.format})`;
        }
    } else if ('anyOf' in schema) {
        type = 'any of';
    } else if ('oneOf' in schema) {
        type = 'one of';
    } else if ('allOf' in schema) {
        type = 'all of';
    } else if ('not' in schema) {
        type = 'not';
    }

    if (SYMBOL_REF_RESOLVED in schema) {
        type = `${schema[SYMBOL_REF_RESOLVED]} (${type})`;
    }

    if (schema.nullable) {
        type = `nullable ${type}`;
    }

    return type;
}
