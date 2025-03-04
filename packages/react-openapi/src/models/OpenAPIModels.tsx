import clsx from 'clsx';

import { OpenAPIDisclosureGroup } from '../OpenAPIDisclosureGroup';
import type { OpenAPIClientContext, OpenAPIContextProps, OpenAPIModelsData } from '../types';
import { OpenAPIModelSchema } from './OpenAPIModelSchema';

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

    return (
        <div className={clsx('openapi-models', className)}>
            {models.length ? (
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
                        body: <OpenAPIModelSchema schema={schema} context={clientContext} />,
                    }))}
                />
            ) : null}
        </div>
    );
}
