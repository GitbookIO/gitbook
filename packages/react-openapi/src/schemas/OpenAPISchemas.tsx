import type { OpenAPISchema } from '@gitbook/openapi-parser';
import clsx from 'clsx';
import { OpenAPIExample } from '../OpenAPIExample';
import { OpenAPIRootSchema } from '../OpenAPISchemaServer';
import { StaticSection } from '../StaticSection';
import {
    type OpenAPIContextInput,
    getOpenAPIClientContext,
    resolveOpenAPIContext,
} from '../context';
import { t } from '../translate';
import { getExampleFromSchema } from '../util/example';
import { OpenAPISchemaItem } from './OpenAPISchemaItem';

/**
 * OpenAPI Schemas component.
 */
export function OpenAPISchemas(props: {
    className?: string;
    schemas: OpenAPISchema[];
    context: OpenAPIContextInput;
    /**
     * Whether to show the schema directly if there is only one.
     */
    grouped?: boolean;
}) {
    const { schemas, context: contextInput, grouped, className } = props;

    const firstSchema = schemas[0];

    if (!firstSchema) {
        return null;
    }

    const context = resolveOpenAPIContext(contextInput);
    const clientContext = getOpenAPIClientContext(context);

    // If there is only one model and we are not grouping, we show it directly.
    if (schemas.length === 1 && !grouped) {
        const title = `The ${firstSchema.name} object`;
        return (
            <div className={clsx('openapi-schemas', className)}>
                <div className="openapi-summary" id={context.id}>
                    {context.renderHeading({
                        title,
                        deprecated: Boolean(firstSchema.schema.deprecated),
                        stability: firstSchema.schema['x-stability'],
                    })}
                </div>
                <div className="openapi-columns">
                    <div className="openapi-column-spec">
                        <StaticSection
                            className="openapi-parameters"
                            header={t(context.translation, 'attributes')}
                        >
                            <OpenAPIRootSchema
                                schema={firstSchema.schema}
                                context={clientContext}
                            />
                        </StaticSection>
                    </div>
                    <div className="openapi-column-preview">
                        <div className="openapi-column-preview-body">
                            <div className="openapi-panel">
                                <h4 className="openapi-panel-heading">{title}</h4>
                                <div className="openapi-panel-body">
                                    <OpenAPIExample
                                        example={getExampleFromSchema({
                                            schema: firstSchema.schema,
                                        })}
                                        context={context}
                                        syntax="json"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If there are multiple schemas, we use a disclosure group to show them all.
    return (
        <div className={clsx('openapi-schemas', className)}>
            {schemas.map(({ name, schema }) => {
                return (
                    <OpenAPISchemaItem
                        key={name}
                        name={name}
                        context={clientContext}
                        schema={schema}
                    />
                );
            })}
        </div>
    );
}
