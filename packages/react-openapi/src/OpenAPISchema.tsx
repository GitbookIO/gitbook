import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import clsx from 'clsx';
import { useId } from 'react';

import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIClientContext } from './types';
import { checkIsReference, resolveDescription } from './utils';

type CircularRefsIds = Map<OpenAPIV3.SchemaObject, string>;

export interface OpenAPISchemaPropertyEntry {
    propertyName?: string | undefined;
    required?: boolean | undefined;
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
    }
) {
    const {
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

    if (alternatives?.[0]?.length) {
        return (
            <OpenAPISchemaAlternativesItem
                {...props}
                circularRefs={circularRefs}
                context={context}
                alternatives={alternatives}
                parentCircularRef={parentCircularRef}
            />
        );
    }

    if ((properties && properties.length > 0) || schema.type === 'object') {
        return (
            <InteractiveSection id={id} className={clsx('openapi-schema', className)}>
                <OpenAPISchemaPresentation {...props} />
                {properties && properties.length > 0 ? (
                    <OpenAPIDisclosure context={context} label={getDisclosureLabel(schema)}>
                        <OpenAPISchemaProperties
                            properties={properties}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    </OpenAPIDisclosure>
                ) : null}
                {parentCircularRef ? (
                    <OpenAPISchemaCircularRef id={parentCircularRef} schema={schema} />
                ) : null}
            </InteractiveSection>
        );
    }

    return (
        <InteractiveSection id={id} className={clsx('openapi-schema', className)}>
            <OpenAPISchemaPresentation {...props} />
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
        <div id={id} className="openapi-schema-properties">
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
    const description = resolveDescription(schema);
    const alternatives = getSchemaAlternatives(schema, new Set(circularRefs?.keys()));

    if (alternatives?.[0]?.length && !subProperties?.length) {
        return (
            <>
                {description ? (
                    <Markdown source={description} className="openapi-schema-description" />
                ) : null}
                <OpenAPIDisclosure context={context} label={getDisclosureLabel(schema)}>
                    <OpenAPISchemaAlternativesItem
                        schema={schema}
                        circularRefs={circularRefs}
                        context={context}
                        alternatives={alternatives}
                    />
                </OpenAPIDisclosure>
            </>
        );
    }

    return (
        <>
            {description ? (
                <Markdown source={description} className="openapi-schema-description" />
            ) : null}
            <OpenAPIDisclosure context={context} label={getDisclosureLabel(schema)}>
                <OpenAPISchemaProperties
                    id={id}
                    properties={subProperties ?? [{ schema }]}
                    circularRefs={
                        subProperties ? new Map(circularRefs).set(schema, id) : circularRefs
                    }
                    context={context}
                />
            </OpenAPIDisclosure>
        </>
    );
}

function OpenAPISchemaAlternativesItem(
    props: OpenAPISchemaPropertyEntry & {
        circularRefs?: CircularRefsIds;
        context: OpenAPIClientContext;
        alternatives: OpenAPISchemaAlternatives;
        parentCircularRef?: string;
    }
) {
    const id = useId();
    const { schema, circularRefs, context, alternatives, parentCircularRef } = props;

    return (
        <InteractiveSection id={id} className={clsx('openapi-schema')}>
            <OpenAPISchemaPresentation {...props} />
            {alternatives[0].map((alternative, index) => (
                <OpenAPISchemaAlternative
                    key={`alternative-${index}`}
                    schema={alternative}
                    circularRefs={circularRefs}
                    context={context}
                />
            ))}
            {parentCircularRef ? (
                <OpenAPISchemaCircularRef id={parentCircularRef} schema={schema} />
            ) : null}
        </InteractiveSection>
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
                Options:{' '}
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

export function OpenAPISchemaPresentation(props: OpenAPISchemaPropertyEntry) {
    const { schema, propertyName, required } = props;

    const shouldDisplayExample = (schema: OpenAPIV3.SchemaObject): boolean => {
        return (
            (typeof schema.example === 'string' && !!schema.example) ||
            typeof schema.example === 'number' ||
            typeof schema.example === 'boolean' ||
            (Array.isArray(schema.example) && schema.example.length > 0) ||
            (typeof schema.example === 'object' &&
                schema.example !== null &&
                Object.keys(schema.example).length > 0)
        );
    };

    const description = resolveDescription(schema);

    return (
        <div className="openapi-schema-presentation">
            <OpenAPISchemaName
                schema={schema}
                type={getSchemaTitle(schema)}
                propertyName={propertyName}
                required={required}
            />
            {schema['x-deprecated-sunset'] ? (
                <div className="openapi-deprecated-sunset openapi-schema-description openapi-markdown">
                    Sunset date:{' '}
                    <span className="openapi-deprecated-sunset-date">
                        {schema['x-deprecated-sunset']}
                    </span>
                </div>
            ) : null}
            {description ? (
                <Markdown source={description} className="openapi-schema-description" />
            ) : null}
            {shouldDisplayExample(schema) ? (
                <div className="openapi-schema-example">
                    Example: <code>{formatExample(schema.example)}</code>
                </div>
            ) : null}
            {schema.pattern ? (
                <div className="openapi-schema-pattern">
                    Pattern: <code>{schema.pattern}</code>
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
    // check array AND schema.items as this is sometimes null despite what the type indicates
    if (schema.type === 'array' && !!schema.items) {
        const items = schema.items;
        const itemProperties = getSchemaProperties(items);
        if (itemProperties) {
            return itemProperties;
        }

        // If the items are a primitive type, we don't need to display them
        if (['string', 'number', 'boolean', 'integer'].includes(items.type) && !items.enum) {
            return null;
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
            Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
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
            const additionalProperties = schema.additionalProperties;

            result.push({
                propertyName: 'Other properties',
                schema: additionalProperties === true ? {} : additionalProperties,
            });
        }

        return result;
    }

    return null;
}

type OpenAPISchemaAlternatives = [
    OpenAPIV3.SchemaObject[],
    OpenAPIV3.DiscriminatorObject | undefined,
];

/**
 * Get the alternatives to display for a schema.
 */
export function getSchemaAlternatives(
    schema: OpenAPIV3.SchemaObject,
    ancestors: Set<OpenAPIV3.SchemaObject> = new Set()
): null | OpenAPISchemaAlternatives {
    const downAncestors = new Set(ancestors).add(schema);

    if (schema.anyOf) {
        return [flattenAlternatives('anyOf', schema.anyOf, downAncestors), schema.discriminator];
    }

    if (schema.oneOf) {
        return [flattenAlternatives('oneOf', schema.oneOf, downAncestors), schema.discriminator];
    }

    if (schema.allOf) {
        return [flattenAlternatives('allOf', schema.allOf, downAncestors), schema.discriminator];
    }

    return null;
}

function flattenAlternatives(
    alternativeType: 'oneOf' | 'allOf' | 'anyOf',
    alternatives: OpenAPIV3.SchemaObject[],
    ancestors: Set<OpenAPIV3.SchemaObject>
): OpenAPIV3.SchemaObject[] {
    return alternatives.reduce((acc, alternative) => {
        if (!!alternative[alternativeType] && !ancestors.has(alternative)) {
            acc.push(...(getSchemaAlternatives(alternative, ancestors)?.[0] || []));
        } else {
            acc.push(alternative);
        }

        return acc;
    }, [] as OpenAPIV3.SchemaObject[]);
}

export function getSchemaTitle(
    schema: OpenAPIV3.SchemaObject,

    /** If the title is inferred in a oneOf with discriminator, we can use it to optimize the title */
    discriminator?: OpenAPIV3.DiscriminatorObject
): string {
    // Try using the discriminator
    if (discriminator?.propertyName && schema.properties) {
        const discriminatorProperty = schema.properties[discriminator.propertyName];
        if (discriminatorProperty && !checkIsReference(discriminatorProperty)) {
            if (discriminatorProperty.enum) {
                return discriminatorProperty.enum.map((value) => value.toString()).join(' | ');
            }
        }
    }

    // Otherwise try to infer a nice title
    let type = 'any';

    if (schema.enum) {
        type = `${schema.type} · enum`;
        // check array AND schema.items as this is sometimes null despite what the type indicates
    } else if (schema.type === 'array' && !!schema.items) {
        type = `${getSchemaTitle(schema.items)}[]`;
    } else if (Array.isArray(schema.type)) {
        type = schema.type.join(' | ');
    } else if (schema.type || schema.properties) {
        type = schema.type ?? 'object';

        if (schema.format) {
            type += ` · ${schema.format}`;
        }
    }

    if ('anyOf' in schema) {
        type = 'any of';
    } else if ('oneOf' in schema) {
        type = 'one of';
    } else if ('allOf' in schema) {
        type = 'all of';
    } else if ('not' in schema) {
        type = 'not';
    }

    return type;
}

function getDisclosureLabel(schema: OpenAPIV3.SchemaObject): string | undefined {
    if (schema.type === 'array' && !!schema.items) {
        if (schema.items.oneOf) {
            return 'available items';
        }

        // Fallback to "child attributes" for enums and objects
        if (schema.items.enum || schema.items.type === 'object') {
            return;
        }

        return schema.items.title ?? schema.title ?? getSchemaTitle(schema.items);
    }

    return schema.title;
}

function formatExample(example: any): string {
    if (typeof example === 'string') {
        return example
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces/newlines into a single space
            .replace(/([\{\}:,])\s+/g, '$1 ') // Ensure a space after {, }, :, and ,
            .replace(/\s+([\{\}:,])/g, ' $1') // Ensure a space before {, }, :, and ,
            .trim();
    }

    return stringifyOpenAPI(example);
}
