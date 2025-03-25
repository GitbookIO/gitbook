import clsx from 'clsx';
import { OpenAPIDisclosureGroup } from '../OpenAPIDisclosureGroup';
import { OpenAPIRootSchema } from '../OpenAPISchemaServer';
import { Section, SectionBody } from '../StaticSection';
import type { OpenAPIClientContext, OpenAPIContextProps, OpenAPISchemasData } from '../types';

type OpenAPISchemasContextProps = Omit<
    OpenAPIContextProps,
    'renderCodeBlock' | 'renderHeading' | 'renderDocument'
>;

/**
 * Display OpenAPI Schemas.
 */
export function OpenAPISchemas(props: {
    className?: string;
    data: OpenAPISchemasData;
    context: OpenAPISchemasContextProps;
}) {
    const { className, data, context } = props;
    const { schemas } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
        blockKey: context.blockKey,
    };

    if (!schemas.length) {
        return null;
    }

    return (
        <div className={clsx('openapi-schemas', className)}>
            <OpenAPIRootSchemasSchema schemas={schemas} context={clientContext} />
        </div>
    );
}

/**
 * Root schema for OpenAPI schemas.
 * It displays a single model or a disclosure group for multiple schemas.
 */
function OpenAPIRootSchemasSchema(props: {
    schemas: OpenAPISchemasData['schemas'];
    context: OpenAPIClientContext;
}) {
    const { schemas, context } = props;

    // If there is only one model, we show it directly.
    if (schemas.length === 1) {
        const schema = schemas?.[0]?.schema;

        if (!schema) {
            return null;
        }

        return (
            <Section>
                <SectionBody>
                    <OpenAPIRootSchema schema={schema} context={context} />
                </SectionBody>
            </Section>
        );
    }

    // If there are multiple schemas, we use a disclosure group to show them all.
    return (
        <OpenAPIDisclosureGroup
            allowsMultipleExpanded
            icon={context.icons.chevronRight}
            groups={schemas.map(({ name, schema }) => ({
                id: name,
                label: (
                    <div className="openapi-response-tab-content" key={`model-${name}`}>
                        <span className="openapi-response-statuscode">{name}</span>
                    </div>
                ),
                tabs: [
                    {
                        id: 'model',
                        body: (
                            <Section className="openapi-section-schemas">
                                <SectionBody>
                                    <OpenAPIRootSchema schema={schema} context={context} />
                                </SectionBody>
                            </Section>
                        ),
                    },
                ],
            }))}
        />
    );
}
