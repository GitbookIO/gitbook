import clsx from 'clsx';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIDisclosureGroup } from '../OpenAPIDisclosureGroup';
import { OpenAPIRootSchema } from '../OpenAPISchema';
import { Section, SectionBody } from '../StaticSection';
import type { OpenAPIClientContext, OpenAPIContextProps, OpenAPIModelsData } from '../types';

/**
 * Display OpenAPI Models.
 */
export function OpenAPIModels(props: {
    className?: string;
    data: OpenAPIModelsData;
    context: OpenAPIContextProps;
}) {
    const { className, data, context } = props;
    const { models } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
        blockKey: context.blockKey,
    };

    if (!models.length) {
        return null;
    }

    return (
        <div className={clsx('openapi-models', className)}>
            <OpenAPIRootModelsSchema models={models} context={clientContext} />
        </div>
    );
}

/**
 * Root schema for OpenAPI models.
 * It displays a single model or a disclosure group for multiple models.
 */
function OpenAPIRootModelsSchema(props: {
    models: [string, OpenAPIV3.SchemaObject][];
    context: OpenAPIClientContext;
}) {
    const { models, context } = props;

    // If there is only one model, we show it directly.
    if (models.length === 1) {
        const schema = models?.[0]?.[1];

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

    // If there are multiple models, we use a disclosure group to show them all.
    return (
        <OpenAPIDisclosureGroup
            allowsMultipleExpanded
            icon={context.icons.chevronRight}
            groups={models.map(([name, schema]) => ({
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
                            <Section className="openapi-section-models">
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
