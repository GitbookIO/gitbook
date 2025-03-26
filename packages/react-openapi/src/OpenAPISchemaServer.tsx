import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import {
    OpenAPIRootSchemaFromServer,
    OpenAPISchemaPropertiesFromServer,
    type OpenAPISchemaPropertyEntry,
} from './OpenAPISchema';
import { decycle } from './decycle';
import type { OpenAPIClientContext } from './types';

export function OpenAPISchemaProperties(props: {
    id?: string;
    properties: OpenAPISchemaPropertyEntry[];
    context: OpenAPIClientContext;
}) {
    return (
        <OpenAPISchemaPropertiesFromServer
            id={props.id}
            properties={JSON.stringify(props.properties, decycle())}
            context={props.context}
        />
    );
}

export function OpenAPIRootSchema(props: {
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
}) {
    return (
        <OpenAPIRootSchemaFromServer
            schema={JSON.stringify(props.schema, decycle())}
            context={props.context}
        />
    );
}
