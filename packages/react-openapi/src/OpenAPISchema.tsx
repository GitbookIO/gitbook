'use client';
// This component does not use any client feature but we don't want to
// render it server-side because it has recursion.

import type { OpenAPICustomOperationProperties, OpenAPIV3 } from '@gitbook/openapi-parser';
import { useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';
import { Markdown } from './Markdown';
import { OpenAPICopyButton } from './OpenAPICopyButton';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type { OpenAPIClientContext } from './context';
import { retrocycle } from './decycle';
import { getDisclosureLabel } from './getDisclosureLabel';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { tString } from './translate';
import { checkIsReference, getSchemaTitle, resolveDescription, resolveFirstExample } from './utils';

type CircularRefsIds = Map<OpenAPIV3.SchemaObject, string>;

export interface OpenAPISchemaPropertyEntry {
    propertyName?: string;
    required?: boolean | null;
    isDiscriminatorProperty?: boolean;
    schema: OpenAPIV3.SchemaObject;
}

/**
 * Render a property of an OpenAPI schema.
 */
function OpenAPISchemaProperty(
    props: {
        property: OpenAPISchemaPropertyEntry;
        context: OpenAPIClientContext;
        circularRefs: CircularRefsIds;
        className?: string;
    } & Omit<ComponentPropsWithoutRef<'div'>, 'property' | 'context' | 'circularRefs' | 'className'>
) {
    const { circularRefs: parentCircularRefs, context, className, property, ...rest } = props;

    const { schema } = property;

    const id = useId();

    const circularRefId = parentCircularRefs.get(schema);
    // Avoid recursing infinitely, and instead render a link to the parent schema
    if (circularRefId) {
        return <OpenAPISchemaCircularRef id={circularRefId} schema={schema} />;
    }

    const circularRefs = new Map(parentCircularRefs);
    circularRefs.set(schema, id);

    const properties = getSchemaProperties(schema);

    const ancestors = new Set(circularRefs.keys());
    const alternatives = getSchemaAlternatives(schema, ancestors);

    const header = <OpenAPISchemaPresentation context={context} property={property} />;
    const content = (() => {
        if (alternatives?.schemas) {
            const { schemas, discriminator } = alternatives;
            return (
                <div className="openapi-schema-alternatives">
                    {schemas.map((alternativeSchema, index) => (
                        <div key={index} className="openapi-schema-alternative">
                            <OpenAPISchemaAlternative
                                schema={alternativeSchema}
                                discriminator={discriminator}
                                circularRefs={circularRefs}
                                context={context}
                            />
                            {index < schemas.length - 1 ? (
                                <OpenAPISchemaAlternativeSeparator
                                    schema={schema}
                                    context={context}
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            );
        }

        if (properties?.length) {
            return (
                <OpenAPISchemaProperties
                    properties={properties}
                    circularRefs={circularRefs}
                    context={context}
                />
            );
        }

        return null;
    })();

    if (properties?.length) {
        return (
            <OpenAPIDisclosure
                icon={context.icons.plus}
                className={clsx('openapi-schema', className)}
                header={header}
                label={(isExpanded) => getDisclosureLabel({ schema, isExpanded, context })}
                {...rest}
            >
                {content}
            </OpenAPIDisclosure>
        );
    }

    return (
        <div id={id} {...rest} className={clsx('openapi-schema', className)}>
            {header}
            {content}
        </div>
    );
}

/**
 * Render a set of properties of an OpenAPI schema.
 */
function OpenAPISchemaProperties(props: {
    id?: string;
    properties: OpenAPISchemaPropertyEntry[];
    circularRefs?: CircularRefsIds;
    context: OpenAPIClientContext;
}) {
    const {
        id,
        properties,
        circularRefs = new Map<OpenAPIV3.SchemaObject, string>(),
        context,
    } = props;

    return (
        <div id={id} className="openapi-schema-properties">
            {properties.map((property, index) => {
                return (
                    <OpenAPISchemaProperty
                        key={index}
                        circularRefs={circularRefs}
                        property={property}
                        context={context}
                        style={{ animationDelay: `${index * 0.02}s` }}
                    />
                );
            })}
        </div>
    );
}

export function OpenAPISchemaPropertiesFromServer(props: {
    id?: string;
    properties: string;
    context: OpenAPIClientContext;
}) {
    return (
        <OpenAPISchemaProperties
            id={props.id}
            properties={JSON.parse(props.properties, retrocycle())}
            context={props.context}
        />
    );
}

/**
 * Render a root schema (such as the request body or response body).
 */
function OpenAPIRootSchema(props: {
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
    circularRefs?: CircularRefsIds;
}) {
    const {
        schema,
        context,
        circularRefs: parentCircularRefs = new Map<OpenAPIV3.SchemaObject, string>(),
    } = props;

    const id = useId();
    const properties = getSchemaProperties(schema);
    const description = resolveDescription(schema);

    if (properties?.length) {
        const circularRefs = new Map(parentCircularRefs);
        circularRefs.set(schema, id);

        return (
            <>
                {description ? (
                    <Markdown source={description} className="openapi-schema-root-description" />
                ) : null}
                <OpenAPISchemaProperties
                    properties={properties}
                    circularRefs={circularRefs}
                    context={context}
                />
            </>
        );
    }

    return (
        <OpenAPISchemaProperty
            className="openapi-schema-root"
            property={{ schema }}
            context={context}
            circularRefs={parentCircularRefs}
        />
    );
}

export function OpenAPIRootSchemaFromServer(props: {
    schema: string;
    context: OpenAPIClientContext;
}) {
    return (
        <OpenAPIRootSchema
            schema={JSON.parse(props.schema, retrocycle())}
            context={props.context}
        />
    );
}

/**
 * Render a tab for an alternative schema.
 * It renders directly the properties if relevant;
 * for primitives, it renders the schema itself.
 */
function OpenAPISchemaAlternative(props: {
    schema: OpenAPIV3.SchemaObject;
    discriminator: OpenAPIV3.DiscriminatorObject | undefined;
    circularRefs: CircularRefsIds;
    context: OpenAPIClientContext;
}) {
    const { schema, discriminator, circularRefs, context } = props;
    const properties = getSchemaProperties(schema, discriminator);

    return properties?.length ? (
        <OpenAPIDisclosure
            icon={context.icons.plus}
            header={<OpenAPISchemaPresentation property={{ schema }} context={context} />}
            label={(isExpanded) => getDisclosureLabel({ schema, isExpanded, context })}
        >
            <OpenAPISchemaProperties
                properties={properties}
                circularRefs={circularRefs}
                context={context}
            />
        </OpenAPIDisclosure>
    ) : (
        <OpenAPISchemaProperty
            property={{ schema }}
            circularRefs={circularRefs}
            context={context}
        />
    );
}

function OpenAPISchemaAlternativeSeparator(props: {
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
}) {
    const { schema, context } = props;

    const anyOf = schema.anyOf || schema.items?.anyOf;
    const oneOf = schema.oneOf || schema.items?.oneOf;
    const allOf = schema.allOf || schema.items?.allOf;

    if (!anyOf && !oneOf && !allOf) {
        return null;
    }

    return (
        <span className="openapi-schema-alternative-separator">
            {(anyOf || oneOf) && tString(context.translation, 'or')}
            {allOf && tString(context.translation, 'and')}
        </span>
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
function OpenAPISchemaEnum(props: {
    schema: OpenAPIV3.SchemaObject & OpenAPICustomOperationProperties;
    context: OpenAPIClientContext;
}) {
    const { schema, context } = props;

    const enumValues = (() => {
        // Render x-gitbook-enum first, as it has a different format
        if (schema['x-gitbook-enum']) {
            return Object.entries(schema['x-gitbook-enum']).map(([name, { description }]) => {
                return {
                    value: name,
                    description,
                };
            });
        }

        if (schema['x-enumDescriptions']) {
            return Object.entries(schema['x-enumDescriptions']).map(([value, description]) => {
                return {
                    value,
                    description,
                };
            });
        }

        return schema.enum?.map((value) => {
            return {
                value,
                description: undefined,
            };
        });
    })();

    if (!enumValues?.length) {
        return null;
    }

    return (
        <span className="openapi-schema-enum">
            {tString(context.translation, 'possible_values')}:{' '}
            {enumValues.map((item, index) => (
                <span key={index} className="openapi-schema-enum-value">
                    <OpenAPICopyButton
                        value={item.value}
                        label={item.description}
                        withTooltip={!!item.description}
                        context={context}
                    >
                        <code>{`${item.value}`}</code>
                    </OpenAPICopyButton>
                </span>
            ))}
        </span>
    );
}

/**
 * Render the top row of a schema. e.g: name, type, and required status.
 */
export function OpenAPISchemaPresentation(props: {
    property: OpenAPISchemaPropertyEntry;
    context: OpenAPIClientContext;
}) {
    const {
        property: { schema, propertyName, required, isDiscriminatorProperty },
        context,
    } = props;

    const description = resolveDescription(schema);
    const example = resolveFirstExample(schema);

    return (
        <div className="openapi-schema-presentation">
            <OpenAPISchemaName
                schema={schema}
                type={getSchemaTitle(schema)}
                propertyName={propertyName}
                isDiscriminatorProperty={isDiscriminatorProperty}
                required={required}
                context={context}
            />
            {typeof schema['x-deprecated-sunset'] === 'string' ? (
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
            {schema.default !== undefined ? (
                <span className="openapi-schema-default">
                    Default:{' '}
                    <code>
                        {typeof schema.default === 'string' && schema.default
                            ? schema.default
                            : stringifyOpenAPI(schema.default)}
                    </code>
                </span>
            ) : null}
            {typeof example === 'string' ? (
                <span className="openapi-schema-example">
                    Example: <code>{example}</code>
                </span>
            ) : null}
            {schema.pattern ? (
                <span className="openapi-schema-pattern">
                    Pattern: <code>{schema.pattern}</code>
                </span>
            ) : null}
            <OpenAPISchemaEnum schema={schema} context={context} />
        </div>
    );
}

/**
 * Get the sub-properties of a schema.
 */
function getSchemaProperties(
    schema: OpenAPIV3.SchemaObject,
    discriminator?: OpenAPIV3.DiscriminatorObject | undefined
): null | OpenAPISchemaPropertyEntry[] {
    // check array AND schema.items as this is sometimes null despite what the type indicates
    if (schema.type === 'array' && schema.items && !checkIsReference(schema.items)) {
        const items = schema.items;
        const itemProperties = getSchemaProperties(items);
        if (itemProperties) {
            return itemProperties.map((prop) => ({
                ...prop,
                isDiscriminatorProperty: discriminator?.propertyName === prop.propertyName,
            }));
        }

        // If the items are a primitive type, we don't need to display them
        if (
            (items.type === 'string' ||
                items.type === 'number' ||
                items.type === 'boolean' ||
                items.type === 'integer') &&
            !items.enum
        ) {
            return null;
        }

        return [{ propertyName: 'items', schema: items }];
    }

    if (schema.type === 'object' || schema.properties) {
        const result: OpenAPISchemaPropertyEntry[] = [];

        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
                if (checkIsReference(propertySchema)) {
                    return;
                }

                result.push({
                    propertyName,
                    required: Array.isArray(schema.required)
                        ? schema.required.includes(propertyName)
                        : undefined,
                    isDiscriminatorProperty: discriminator?.propertyName === propertyName,
                    schema: propertySchema,
                });
            });
        }

        if (schema.additionalProperties && !checkIsReference(schema.additionalProperties)) {
            result.push({
                propertyName: 'Other properties',
                schema: schema.additionalProperties === true ? {} : schema.additionalProperties,
            });
        }

        return result;
    }

    return null;
}

type AlternativeType = 'oneOf' | 'allOf' | 'anyOf';

type SchemaAlternatives = {
    type: AlternativeType;
    schemas: OpenAPIV3.SchemaObject[];
    discriminator?: OpenAPIV3.DiscriminatorObject;
} | null;

/**
 * Get the alternatives to display for a schema.
 */
export function getSchemaAlternatives(
    schema: OpenAPIV3.SchemaObject,
    ancestors: Set<OpenAPIV3.SchemaObject> = new Set()
): SchemaAlternatives {
    // Check for nested alternatives in `items`
    if (
        schema.items &&
        ('oneOf' in schema.items || 'allOf' in schema.items || 'anyOf' in schema.items)
    ) {
        return getSchemaAlternatives(schema.items, ancestors);
    }

    const alternatives:
        | [
              AlternativeType,
              (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[],
              OpenAPIV3.DiscriminatorObject?,
          ]
        | null = (() => {
        if (schema.anyOf) {
            return ['anyOf', schema.anyOf, schema.discriminator];
        }
        if (schema.oneOf) {
            return ['oneOf', schema.oneOf, schema.discriminator];
        }
        if (schema.allOf) {
            return ['allOf', schema.allOf, schema.discriminator];
        }
        return null;
    })();

    if (!alternatives) {
        return null;
    }

    const [type, schemas, discriminator] = alternatives;

    return {
        type,
        schemas:
            mergeAlternatives(
                type,
                flattenAlternatives(type, schemas, new Set(ancestors).add(schema))
            ) ?? [],
        discriminator,
    };
}

// These extensions are safe to merge
const safeExtensions = [
    'description',
    'title',
    'example',
    'examples',
    'default',
    'readOnly',
    'writeOnly',
    'deprecated',
];

/**
 * Determine if a schema is safe to merge based on its properties
 */
function isSafeToMerge(schema: OpenAPIV3.SchemaObject): boolean {
    const keys = Object.keys(schema);

    const coreProperties = ['type', 'properties', 'required', 'nullable'];

    const coreKeys = keys.filter((key) => coreProperties.includes(key));
    const unknownKeys = keys.filter(
        (key) =>
            !coreProperties.includes(key) && !safeExtensions.includes(key) && !key.startsWith('x-')
    );

    return coreKeys.length > 0 && unknownKeys.length === 0;
}

/**
 * Merge alternatives of the same type into a single schema.
 * - Merge string enums
 * - Safely merge object schemas with compatible properties
 */
function mergeAlternatives(
    alternativeType: AlternativeType,
    schemasOrRefs: OpenAPIV3.SchemaObject[]
): OpenAPIV3.SchemaObject[] | null {
    switch (alternativeType) {
        case 'oneOf': {
            return schemasOrRefs.reduce<OpenAPIV3.SchemaObject[]>((acc, schemaOrRef) => {
                const latest = acc.at(-1);

                if (
                    latest &&
                    latest.type === 'string' &&
                    latest.enum &&
                    schemaOrRef.type === 'string' &&
                    schemaOrRef.enum
                ) {
                    latest.enum = Array.from(new Set([...latest.enum, ...schemaOrRef.enum]));
                    latest.nullable = latest.nullable || schemaOrRef.nullable;
                    return acc;
                }

                acc.push(schemaOrRef);
                return acc;
            }, []);
        }
        case 'allOf': {
            return schemasOrRefs.reduce<OpenAPIV3.SchemaObject[]>((acc, schemaOrRef) => {
                const latest = acc.at(-1);

                if (
                    latest &&
                    latest.type === 'string' &&
                    latest.enum &&
                    schemaOrRef.type === 'string' &&
                    schemaOrRef.enum
                ) {
                    const keys = Object.keys(schemaOrRef);
                    if (keys.every((key) => ['type', 'enum', 'nullable'].includes(key))) {
                        latest.enum = Array.from(new Set([...latest.enum, ...schemaOrRef.enum]));
                        latest.nullable = latest.nullable || schemaOrRef.nullable;
                        return acc;
                    }
                }

                if (latest && latest.type === 'object' && schemaOrRef.type === 'object') {
                    const keys = Object.keys(schemaOrRef);

                    if (isSafeToMerge(schemaOrRef)) {
                        const safeKeys = keys.filter((key) => safeExtensions.includes(key));
                        const vendorKeys = keys.filter((key) => key.startsWith('x-'));

                        latest.properties = {
                            ...(latest.properties || {}),
                            ...(schemaOrRef.properties || {}),
                        };
                        latest.required = Array.from(
                            new Set([
                                ...(latest.required && Array.isArray(latest.required)
                                    ? latest.required
                                    : []),
                                ...(schemaOrRef.required && Array.isArray(schemaOrRef.required)
                                    ? schemaOrRef.required
                                    : []),
                            ])
                        );
                        latest.nullable = latest.nullable || schemaOrRef.nullable;

                        // Preserve safe extensions and vendor extensions
                        // Always overwrite (last schema has priority)
                        [...vendorKeys, ...safeKeys].forEach((key) => {
                            if (
                                typeof latest[key] === 'object' &&
                                typeof schemaOrRef[key] === 'object'
                            ) {
                                latest[key] = { ...latest[key], ...schemaOrRef[key] };
                            } else {
                                latest[key] = schemaOrRef[key];
                            }
                        });

                        return acc;
                    }
                }

                acc.push(schemaOrRef);
                return acc;
            }, []);
        }
        default:
            return schemasOrRefs;
    }
}

function flattenAlternatives(
    alternativeType: AlternativeType,
    schemasOrRefs: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[],
    ancestors: Set<OpenAPIV3.SchemaObject>
): OpenAPIV3.SchemaObject[] {
    // Get the parent schema's required fields from the most recent ancestor
    const latestAncestor = Array.from(ancestors).pop();

    return schemasOrRefs.reduce<OpenAPIV3.SchemaObject[]>((acc, schemaOrRef) => {
        if (checkIsReference(schemaOrRef)) {
            return acc;
        }

        if (schemaOrRef[alternativeType] && !ancestors.has(schemaOrRef)) {
            const alternatives = getSchemaAlternatives(schemaOrRef, ancestors);
            if (alternatives?.schemas) {
                acc.push(
                    ...alternatives.schemas.map((schema) => ({
                        ...schema,
                        required: mergeRequiredFields(schema, latestAncestor),
                    }))
                );
            }
            return acc;
        }

        // For direct schemas, handle required fields
        const schema = {
            ...schemaOrRef,
            required: mergeRequiredFields(schemaOrRef, latestAncestor),
        };

        acc.push(schema);
        return acc;
    }, []);
}

/**
 * Merge the required fields of a schema with the required fields of its latest ancestor.
 */
function mergeRequiredFields(
    schemaOrRef: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    latestAncestor: OpenAPIV3.SchemaObject | undefined
) {
    if (!schemaOrRef.required && !latestAncestor?.required) {
        return undefined;
    }

    if (checkIsReference(schemaOrRef)) {
        return latestAncestor?.required;
    }

    return Array.from(
        new Set([...(latestAncestor?.required || []), ...(schemaOrRef.required || [])])
    );
}
