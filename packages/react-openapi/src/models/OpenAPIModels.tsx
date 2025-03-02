import clsx from 'clsx';

import { OpenAPIDisclosureGroup } from '../OpenAPIDisclosureGroup';
import { OpenAPISchemaProperty } from '../OpenAPISchema';
import type { OpenAPIClientContext, OpenAPIContextProps, OpenAPIOperationData } from '../types';

/**
 * Display OpenAPI Models.
 */
export function OpenAPIModels(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { className, data, context } = props;
    const { components } = data;

    const clientContext: OpenAPIClientContext = {
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        icons: context.icons,
        blockKey: context.blockKey,
    };

    return (
        <div className={clsx('openapi-models', className)}>
            {components.length ? (
                <OpenAPIDisclosureGroup
                    allowsMultipleExpanded
                    icon={context.icons.chevronRight}
                    groups={components.map(([name, schema]) => ({
                        id: name,
                        label: (
                            <div className="openapi-response-tab-content" key={`model-${name}`}>
                                <span className="openapi-response-statuscode">{name}</span>
                            </div>
                        ),
                        body: <OpenAPISchemaProperty schema={schema} context={clientContext} />,
                    }))}
                />
            ) : null}
        </div>
    );
}
