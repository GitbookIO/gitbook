import classNames from 'classnames';
import { OpenAPIV3 } from '@scalar/openapi-types';
import React, { useId } from 'react';

import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPIClientContext } from './types';
import { checkIsReference, noReference } from './utils';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';

type CircularRefsIds = Map<OpenAPIV3.SchemaObject, string>;

export interface OpenAPISchemaPropertyEntry {
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
        schema,
        circularRefs: parentCircularRefs = new Map<OpenAPIV3.SchemaObject, string>(),
        context,
        className,
        required,
    } = props;

    const id = useId();

    const parentCircularRef = parentCircularRefs.get(schema);
    const circularRefs = new Map(parentCircularRefs).set(schema, id);

    // Avoid recursing infinitely, and instead render a link to the parent schema
    const properties = parentCircularRef ? null : getSchemaProperties(schema);
    const alternatives = parentCircularRef
        ? null
        : getSchemaAlternatives(schema, new Set(circularRefs.keys()));

    if ((properties && !!properties.length) || schema.type === 'object') {
        return (
            <div className="openapi-schema-presentation">
                <OpenAPISchemaName
                    type={getSchemaTitle(schema)}
                    propertyName={propertyName}
                    required={required}
                />
                {schema.description ? (
                    <Markdown source={schema.description} className="openapi-schema-description" />
                ) : null}
                <OpenAPIDisclosure context={context}>
                    {properties && properties.length > 0 ? (
                        <OpenAPISchemaProperties
                            properties={properties}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    ) : null}
                </OpenAPIDisclosure>
            </div>
        );
    }

    if (alternatives?.[0]?.length) {
        return (
            <div className="openapi-schema-presentation">
                <OpenAPISchemaName
                    type={getSchemaTitle(schema)}
                    propertyName={propertyName}
                    required={required}
                />
                {schema.description ? (
                    <Markdown source={schema.description} className="openapi-schema-description" />
                ) : null}
                {alternatives[0].map((alternative, index) => (
                    <OpenAPIDisclosure key={`${index}-${alternative.title}`} context={context}>
                        <OpenAPISchemaProperty
                            propertyName={getSchemaTitle(alternative, alternatives[1])}
                            schema={alternative}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    </OpenAPIDisclosure>
                ))}
            </div>
        );
    }

    return (
        <InteractiveSection
            id={id}
            className={classNames('openapi-schema', className)}
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
            header={<OpenAPISchemaPresentation {...props} />}
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
 * It renders directly the properties if relevant;
 * for primitives, it renders the schema itself.
 */
function OpenAPISchemaAlternative(props: {
    schema: OpenAPIV3.SchemaObject;
    circularRefs?: CircularRefsIds;
    context: OpenAPIClientContext;
}) {
    const { schema, circularRefs, context } = props;
    const id = useId();
    const subProperties = getSchemaProperties(schema);

    return (
        <OpenAPISchemaProperties
            id={id}
            properties={subProperties ?? [{ schema }]}
            circularRefs={subProperties ? new Map(circularRefs).set(schema, id) : circularRefs}
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
            <span>
                Options{' '}
                {enumValues.map((value, index) => (
                    <span key={index} className="openapi-schema-enum-value">
                        <code>{`${value}`}</code>
                        {index < enumValues.length - 1 ? ', ' : ''}
                    </span>
                ))}
            </span>
        </div>
    );
}

function OpenAPISchemaPresentation(props: OpenAPISchemaPropertyEntry) {
    const { schema, propertyName, required } = props;

    const shouldDisplayExample = (schema: OpenAPIV3.SchemaObject): boolean => {
        return (
            typeof schema.example === 'string' ||
            typeof schema.example === 'number' ||
            typeof schema.example === 'boolean'
        );
    };

    return (
        <div className={classNames('openapi-schema-presentation')}>
            <OpenAPISchemaName
                type={getSchemaTitle(schema)}
                propertyName={propertyName}
                required={required}
            />
            {schema.description ? (
                <Markdown source={schema.description} className="openapi-schema-description" />
            ) : null}
            {shouldDisplayExample(schema) ? (
                <div className="openapi-schema-example">
                    Example{' '}
                    <code>
                        {typeof schema.example === 'string'
                            ? schema.example
                            : stringifyOpenAPI(schema.example)}
                    </code>
                </div>
            ) : null}
            {schema.pattern ? (
                <div className="openapi-schema-pattern">
                    Pattern <code>{schema.pattern}</code>
                </div>
            ) : null}
            {schema.enum && schema.enum.length > 0 ? (
                <OpenAPISchemaEnum enumValues={schema.enum} />
            ) : null}
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
                const isReference = checkIsReference(rawPropertySchema);
                const propertySchema: OpenAPIV3.SchemaObject = isReference
                    ? { propertyName }
                    : rawPropertySchema;
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

export function getSchemaTitle(
    schema: OpenAPIV3.SchemaObject,

    /** If the title is inferred in a oneOf with discriminator, we can use it to optimize the title */
    discriminator?: OpenAPIV3.DiscriminatorObject,
): string {
    if (schema.title) {
        // If the schema has a title, use it
        return schema.title;
    }

    // Try using the discriminator
    if (discriminator?.propertyName && schema.properties) {
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
        type = `${getSchemaTitle(noReference(schema.items))}[]`;
    } else if (schema.type || schema.properties) {
        type = schema.type ?? 'object';

        if (schema.format) {
            type += ` ${schema.format}`;
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

    if (schema.nullable) {
        type = `nullable ${type}`;
    }

    return type;
}
