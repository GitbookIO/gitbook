import type { OpenAPICustomOperationProperties, OpenAPIV3 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import type { OpenAPIContext } from './context';
import { resolveDescription } from './utils';

/**
 * Display the description of an OpenAPI operation.
 */
export function OpenAPIOperationDescription(props: {
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;
    context: OpenAPIContext;
}) {
    const { operation } = props;
    if (operation['x-gitbook-description-document']) {
        return (
            <div className="openapi-intro">
                {props.context.renderDocument({
                    document: operation['x-gitbook-description-document'],
                })}
            </div>
        );
    }

    const description = resolveDescription(operation);
    if (!description) {
        return null;
    }

    return (
        <div className="openapi-intro">
            <Markdown className="openapi-description" source={description} />
        </div>
    );
}
