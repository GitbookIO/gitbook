'use client';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type { OpenAPIClientContext } from './context';
import { tString } from './translate';

export function getDisclosureLabel(props: {
    schema: OpenAPIV3.SchemaObject;
    isExpanded: boolean;
    context: OpenAPIClientContext;
}) {
    const { schema, isExpanded, context } = props;
    let label: string;
    if (schema.type === 'array' && !!schema.items) {
        if (schema.items.oneOf) {
            label = tString(context.translation, 'available_items').toLowerCase();
        } else {
            label = tString(context.translation, 'properties').toLowerCase();
        }
    } else {
        label = tString(context.translation, 'properties').toLowerCase();
    }

    return tString(context.translation, isExpanded ? 'hide' : 'show', label);
}
