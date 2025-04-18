import clsx from 'clsx';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPIColumnSpec } from './common/OpenAPIColumnSpec';
import { OpenAPISummary } from './common/OpenAPISummary';
import { type OpenAPIContextInput, resolveOpenAPIContext } from './context';
import type { OpenAPIOperationData } from './types';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContextInput;
}) {
    const { className, data, context: contextInput } = props;

    const context = resolveOpenAPIContext(contextInput);

    return (
        <div className={clsx('openapi-operation', className)}>
            <OpenAPISummary data={data} context={context} />
            <div className="openapi-columns">
                <OpenAPIColumnSpec data={data} context={context} />
                <div className="openapi-column-preview">
                    <div className="openapi-column-preview-body">
                        <OpenAPICodeSample data={data} context={context} />
                        <OpenAPIResponseExample data={data} context={context} />
                    </div>
                </div>
            </div>
        </div>
    );
}
