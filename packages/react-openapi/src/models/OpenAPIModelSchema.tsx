import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import clsx from 'clsx';
import { useId } from 'react';
import { InteractiveSection } from '../InteractiveSection';
import {
    OpenAPISchemaAlternativesItem,
    OpenAPISchemaCircularRef,
    OpenAPISchemaProperties,
    OpenAPISchemaProperty,
    type OpenAPISchemaPropertyEntry,
    getSchemaAlternatives,
    getSchemaProperties,
} from '../OpenAPISchema';
import type { OpenAPIClientContext } from '../types';

type CircularRefsIds = Map<OpenAPIV3.SchemaObject, string>;

export function OpenAPIModelSchema(
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

    if (alternatives?.[0].length) {
        return (
            <OpenAPISchemaAlternativesItem
                schema={schema}
                circularRefs={circularRefs}
                context={context}
                alternatives={alternatives}
            />
        );
    }

    if ((properties && properties.length > 0) || schema.type === 'object') {
        return (
            <InteractiveSection id={id} className={clsx('openapi-schema', className)}>
                {properties && properties.length > 0 ? (
                    <div className="openapi-models-properties">
                        <OpenAPISchemaProperties
                            properties={properties}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    </div>
                ) : null}
                {parentCircularRef ? (
                    <OpenAPISchemaCircularRef id={parentCircularRef} schema={schema} />
                ) : null}
            </InteractiveSection>
        );
    }

    return (
        <InteractiveSection id={id} className={clsx('openapi-schema', className)}>
            {(properties && properties.length > 0) ||
            (schema.enum && schema.enum.length > 0) ||
            parentCircularRef ? (
                <div className="openapi-models-properties">
                    {properties?.length ? (
                        <OpenAPISchemaProperties
                            properties={properties}
                            circularRefs={circularRefs}
                            context={context}
                        />
                    ) : (
                        <OpenAPISchemaProperty schema={schema} context={context} />
                    )}
                    {parentCircularRef ? (
                        <OpenAPISchemaCircularRef id={parentCircularRef} schema={schema} />
                    ) : null}
                </div>
            ) : null}
        </InteractiveSection>
    );
}
